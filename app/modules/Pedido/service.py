from decimal import Decimal
from typing import List, Optional

from fastapi import HTTPException
from sqlmodel import select

from app.core.UnitOfWork import UnitOfWork
from app.modules.DetallePedido.model import DetallePedido
from app.modules.DireccionEntrega.model import DireccionEntrega
from app.modules.EstadoPedido.model import EstadoPedido
from app.modules.FormaPago.model import FormaPago
from app.modules.HistorialEstadoPedido.model import HistorialEstadoPedido
from app.modules.Ingrediente.model import Ingrediente
from app.modules.Pedido.model import Pedido
from app.modules.Pedido.schema import DetallePedidoCreate, PedidoCreate, PedidoCambiarEstado
from app.modules.Producto.model import Producto
from app.modules.ProductoIngrediente.model import ProductoIngrediente

TRANSICIONES: dict[str, list[str]] = {
    "PENDIENTE":  ["CONFIRMADO", "CANCELADO"],
    "CONFIRMADO": ["EN_PREP",    "CANCELADO"],
    "EN_PREP":    ["EN_CAMINO",  "CANCELADO"],
    "EN_CAMINO":  ["ENTREGADO",  "CANCELADO"],
}

CANCELACION_CLIENT = {"PENDIENTE", "CONFIRMADO"}


def _cargar_detalles(uow: UnitOfWork, pedido: Pedido) -> Pedido:
    pedido.detalles = uow._session.exec(
        select(DetallePedido).where(DetallePedido.pedido_id == pedido.id)
    ).all()
    return pedido


def get_all(uow: UnitOfWork, usuario_id: Optional[int], offset: int, limit: int) -> List[Pedido]:
    query = select(Pedido)
    if usuario_id is not None:
        query = query.where(Pedido.usuario_id == usuario_id)
    pedidos = uow._session.exec(query.offset(offset).limit(limit)).all()
    for p in pedidos:
        _cargar_detalles(uow, p)
    return pedidos


def get_by_id(uow: UnitOfWork, pedido_id: int) -> Pedido:
    pedido = uow._session.get(Pedido, pedido_id)
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    return _cargar_detalles(uow, pedido)


def create(uow: UnitOfWork, usuario_id: int, data: PedidoCreate) -> Pedido:
    with uow:
        fp = uow._session.get(FormaPago, data.forma_pago_codigo)
        if not fp or not fp.habilitado:
            raise HTTPException(status_code=404, detail="Forma de pago no disponible")

        direccion = uow._session.get(DireccionEntrega, data.direccion_entrega_id)
        if not direccion or not direccion.habilitado or direccion.usuario_id != usuario_id:
            raise HTTPException(status_code=404, detail="Dirección de entrega no encontrada")

        if not data.detalles:
            raise HTTPException(status_code=422, detail="El pedido debe tener al menos un producto")

        subtotal = Decimal("0.00")
        items = []
        for item in data.detalles:
            producto = uow._session.get(Producto, item.producto_id)
            if not producto or not producto.disponible or not producto.habilitado:
                raise HTTPException(status_code=404, detail=f"Producto {item.producto_id} no disponible")
            precio = Decimal(str(producto.precio))
            subtotal += precio * item.cantidad
            items.append((item, producto, precio))

        for item, producto, _ in items:
            links = uow._session.exec(
                select(ProductoIngrediente).where(ProductoIngrediente.producto_id == producto.id)
            ).all()
            for link in links:
                ingrediente = uow._session.get(Ingrediente, link.ingrediente_id)
                necesario = link.cantidad * item.cantidad
                if ingrediente.stock_cantidad < necesario:
                    raise HTTPException(
                        status_code=409,
                        detail=f"Stock insuficiente de '{ingrediente.nombre}' "
                               f"(disponible: {ingrediente.stock_cantidad}, necesario: {necesario})",
                    )

        total = subtotal + data.costo_envio
        pedido = Pedido(
            usuario_id=usuario_id,
            forma_pago_codigo=data.forma_pago_codigo,
            direccion_entrega_id=data.direccion_entrega_id,
            estado_codigo="PENDIENTE",
            subtotal=subtotal,
            costo_envio=data.costo_envio,
            total=total,
            notas=data.notas,
        )
        uow._session.add(pedido)
        uow._session.flush()

        detalles = []
        for item, producto, precio in items:
            detalle = DetallePedido(
                pedido_id=pedido.id,
                producto_id=item.producto_id,
                cantidad=item.cantidad,
                nombre=producto.nombre,
                precio=precio,
                subtotal=precio * item.cantidad,
                personalizacion=item.personalizacion,
            )
            uow._session.add(detalle)
            detalles.append(detalle)

            links = uow._session.exec(
                select(ProductoIngrediente).where(ProductoIngrediente.producto_id == producto.id)
            ).all()
            for link in links:
                ingrediente = uow._session.get(Ingrediente, link.ingrediente_id)
                ingrediente.stock_cantidad -= link.cantidad * item.cantidad

        uow._session.flush()
        pedido.detalles = detalles
        return pedido


def cambiar_estado(
    uow: UnitOfWork,
    pedido_id: int,
    data: PedidoCambiarEstado,
    actor_id: int,
    es_cliente: bool = False,
) -> Pedido:
    with uow:
        pedido = uow._session.get(Pedido, pedido_id)
        if not pedido:
            raise HTTPException(status_code=404, detail="Pedido no encontrado")

        estado_actual = pedido.estado_codigo
        destino = data.estado_pedido_codigo

        if not uow._session.get(EstadoPedido, destino):
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
            detalles = uow._session.exec(
                select(DetallePedido).where(DetallePedido.pedido_id == pedido.id)
            ).all()
            for detalle in detalles:
                links = uow._session.exec(
                    select(ProductoIngrediente).where(ProductoIngrediente.producto_id == detalle.producto_id)
                ).all()
                for link in links:
                    ingrediente = uow._session.get(Ingrediente, link.ingrediente_id)
                    if ingrediente:
                        ingrediente.stock_cantidad += link.cantidad * detalle.cantidad

        uow._session.add(HistorialEstadoPedido(
            pedido_id=pedido.id,
            estado_desde_id=estado_actual,
            estado_hacia_id=destino,
            usuario_id=actor_id,
        ))

        uow._session.flush()
        return _cargar_detalles(uow, pedido)
