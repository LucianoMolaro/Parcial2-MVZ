from collections import defaultdict
from decimal import Decimal
from typing import List, Optional

from fastapi import HTTPException, status

from app.core.UnitOfWork import UnitOfWork
from app.modules.DetallePedido.model import DetallePedido
from app.modules.DireccionEntrega.model import DireccionEntrega
from app.modules.HistorialEstadoPedido.model import HistorialEstadoPedido
from app.modules.Pedido.model import Pedido
from app.modules.DireccionEntrega.schema import DireccionRead
from app.modules.Pedido.schema import DetallePedidoRead, PedidoCreate, PedidoCambiarEstado, PedidoRead
from app.modules.Producto.model import Producto
from app.modules.Usuario.model import Usuario

def _cargar_detalles(uow: UnitOfWork, pedido: Pedido) -> PedidoRead:
    dir = pedido.direccion_entrega
    detalles = [
        DetallePedidoRead(
            pedido_id=d.pedido_id,
            producto_id=d.producto_id,
            cantidad=d.cantidad,
            nombre=d.nombre,
            precio=d.precio,
            subtotal=d.subtotal,
            personalizacion_nombres=getattr(d, "personalizacion_nombres", []) or [],
        )
        for d in pedido.detalles
    ]
    return PedidoRead(
        id=pedido.id,
        usuario_id=pedido.usuario_id,
        forma_pago_codigo=pedido.forma_pago_codigo,
        direccion=DireccionRead(alias=dir.alias, calle1=dir.calle1, altura=dir.altura, ciudad=dir.ciudad),
        estado_codigo=pedido.estado_codigo,
        subtotal=pedido.subtotal,
        costo_envio=pedido.costo_envio,
        total=pedido.total,
        notas=pedido.notas,
        created_at=pedido.created_at.isoformat() if pedido.created_at else None,
        detalles=detalles,
    )


def get_all(uow: UnitOfWork, usuario_id_filter: Optional[int], offset: int, limit: int) -> List[PedidoRead]:
    return [_cargar_detalles(uow, p) for p in uow.pedidos.get_all_filtrado(usuario_id_filter, offset, limit)]


def get_by_id(uow: UnitOfWork, pedido_id: int) -> PedidoRead:
    pedido = uow.pedidos.get_by_id(pedido_id)
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    return _cargar_detalles(uow, pedido)


TRANSICIONES: dict[str, list[str]] = {
    "PENDIENTE":  ["CONFIRMADO", "CANCELADO"],
    "CONFIRMADO": ["EN_PREP",    "CANCELADO"],
    "EN_PREP":    ["EN_CAMINO",  "CANCELADO"],
    "EN_CAMINO":  ["ENTREGADO",  "CANCELADO"],
}

CANCELACION_CLIENT = {"PENDIENTE", "CONFIRMADO"}


def crear_pedido(uow: UnitOfWork, usuario: Usuario, data: PedidoCreate) -> PedidoRead:
    direccion = uow.direcciones.get_by_id(data.direccion)

    if direccion is None or direccion.usuario_id != usuario.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dirección inválida."
        )

    forma_pago = uow.formas_pago.get_by_id(data.forma_pago)

    if forma_pago is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Forma de pago inválida."
        )

    producto_ids = [p.id for p in data.productos]

    productos = uow.productos.get_by_ids(producto_ids)

    productos = {
        p.id: p
        for p in productos
    }

    pedido = Pedido(
        usuario_id=usuario.id,
        direccion_entrega_id=direccion.id,
        forma_pago_codigo=forma_pago.codigo,
        estado_codigo="PENDIENTE",
        subtotal=Decimal("0"),
        descuento=Decimal("0"),
        costo_envio=Decimal("50"),
        total=Decimal("0"),
    )

    uow.pedidos.add(pedido)

    subtotal = Decimal("0")

    for item in data.productos:

        producto = productos.get(item.id)

        if producto is None:
            raise HTTPException(
                status_code=404,
                detail=f"Producto {item.id} inexistente."
            )

        if not producto.habilitado:
            raise HTTPException(
                status_code=400,
                detail=f"{producto.nombre} no está disponible."
            )

        if producto.stock_cantidad < item.cantidad:
            raise HTTPException(
                status_code=400,
                detail=f"No hay stock suficiente de {producto.nombre}."
            )

        personalizacion_ids = []
        personalizacion_nombres = []

        for relacion in producto.producto_ingrediente:

            if (
                relacion.es_removible
                and relacion.ingrediente_id in item.personalizacion
            ):
                continue

            personalizacion_ids.append(relacion.ingrediente.id)
            personalizacion_nombres.append(relacion.ingrediente.nombre)

        detalle = DetallePedido(
            pedido_id=pedido.id,
            producto_id=producto.id,
            cantidad=item.cantidad,
            nombre=producto.nombre,
            precio=Decimal(str(producto.precio)),
            subtotal=Decimal(str(producto.precio))
            * item.cantidad,
            personalizacion=personalizacion_ids,
            personalizacion_nombres=personalizacion_nombres,
        )

        pedido.detalles.append(detalle)

        producto.stock_cantidad -= item.cantidad

        subtotal += detalle.subtotal

    pedido.subtotal = subtotal
    pedido.total = (
        subtotal
        + pedido.costo_envio
        - pedido.descuento
    )

    return _cargar_detalles(uow, pedido)





        


def cambiar_estado(
    uow: UnitOfWork,
    pedido_id: int,
    data: PedidoCambiarEstado,
    actor_id: int,
    es_cliente: bool = False,
) -> Pedido:
    with uow:
        pedido = uow.pedidos.get_by_id(pedido_id)
        if not pedido:
            raise HTTPException(status_code=404, detail="Pedido no encontrado")

        estado_actual = pedido.estado_codigo
        destino = data.estado_pedido_codigo

        if not uow.estados_pedido.get_by_id(destino):
            raise HTTPException(status_code=404, detail="Estado de pedido no encontrado")

        transiciones_validas = TRANSICIONES.get(estado_actual, [])
        if destino not in transiciones_validas:
            raise HTTPException(
                status_code=409,
                detail=f"Transición inválida: {estado_actual} → {destino}. Válidas: {transiciones_validas}",
            )

        if es_cliente:
            if destino != "CANCELADO":
                raise HTTPException(status_code=403, detail="El cliente solo puede cancelar su pedido")
            if estado_actual not in CANCELACION_CLIENT:
                raise HTTPException(
                    status_code=409,
                    detail=f"Solo podés cancelar desde PENDIENTE o CONFIRMADO (actual: {estado_actual})",
                )

        pedido.estado_codigo = destino

        if destino == "CANCELADO":
            for detalle in uow.detalles.get_by_pedido(pedido.id):
                for link in uow.producto_ingredientes.get_by_producto(detalle.producto_id):
                    ingrediente = uow.ingredientes.get_by_id(link.ingrediente_id)
                    if ingrediente:
                        ingrediente.stock_cantidad += float(link.cantidad) * detalle.cantidad

        uow.historial.add(HistorialEstadoPedido(
            pedido_id=pedido.id,
            estado_desde_id=estado_actual,
            estado_hacia_id=destino,
            usuario_id=actor_id,
        ))

        return _cargar_detalles(uow, pedido)
