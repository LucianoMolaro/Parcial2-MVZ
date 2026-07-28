from decimal import Decimal
from typing import List, Optional

from fastapi import HTTPException

from app.core.MercadoPago import crear_preferencia
from app.core.UnitOfWork import UnitOfWork
from app.core.WsManager import ws_manager
from app.core.Config import settings
from app.modules.DetallePedido.model import DetallePedido
from app.modules.HistorialEstadoPedido.model import HistorialEstadoPedido
from app.modules.Pedido.model import Pedido
from app.modules.Pedido.schema import FormaPago, PedidoCambiarEstado, PedidoCreate


def get_all(uow: UnitOfWork, usuario_id_filter: Optional[int], offset: int, limit: int) -> List[Pedido]:
    return uow.pedidos.get_all_filtrado(usuario_id_filter, offset, limit)


def get_by_id(uow: UnitOfWork, pedido_id: int) -> Pedido:
    pedido = uow.pedidos.get_by_id(pedido_id)
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    return pedido




TRANSICIONES: dict[str, list[str]] = {
    "PENDIENTE":  ["CONFIRMADO", "CANCELADO"],
    "CONFIRMADO": ["EN_PREP",    "CANCELADO"],
    "EN_PREP":    ["EN_CAMINO",  "CANCELADO"],
    "EN_CAMINO":  ["ENTREGADO",  "CANCELADO"],
}

CANCELACION_CLIENT = {"PENDIENTE", "CONFIRMADO"}


async def crear_pedido(uow: UnitOfWork, data: PedidoCreate, usuario_id: int) -> tuple[Pedido, Optional[str]]:
    direccion_id: Optional[int] = None

    if data.direccion is not None:
        direccion = uow.direcciones.get_by_id(data.direccion)
        if direccion is None or direccion.usuario_id != usuario_id:
            raise HTTPException(status_code=404, detail="Dirección inválida.")
        direccion_id = direccion.id
    elif data.forma_pago != FormaPago.EFECTIVO:
        # Sin dirección = retiro en el local, y el retiro solo admite efectivo.
        raise HTTPException(status_code=400, detail="El retiro en el local solo admite pago en efectivo.")

    producto_ids = [p.id for p in data.productos]
    productos = {p.id: p for p in uow.productos.get_by_ids(producto_ids)}

    with uow:
        pedido = Pedido(
            usuario_id=usuario_id,
            direccion_entrega_id=direccion_id,
            forma_pago_codigo=data.forma_pago.value,
            estado_codigo="PENDIENTE",
            subtotal=Decimal("0"),
            descuento=Decimal("0"),
            costo_envio=Decimal("0"),
            total=Decimal("0"),
        )
        uow.pedidos.add(pedido)

        subtotal = Decimal("0")

        for item in data.productos:
            producto = productos.get(item.id)
            if producto is None:
                raise HTTPException(status_code=404, detail=f"Producto {item.id} inexistente.")
            if not producto.habilitado:
                raise HTTPException(status_code=400, detail=f"{producto.nombre} no está disponible.")
            if producto.stock_cantidad < item.cantidad:
                raise HTTPException(status_code=400, detail=f"No hay stock suficiente de {producto.nombre}.")

            # Solo se puede "sacar" un ingrediente si es removible y pertenece al producto
            removibles_validos = {
                rel.ingrediente_id for rel in producto.producto_ingrediente if rel.es_removible
            }
            personalizacion_ids = [i for i in item.personalizacion if i in removibles_validos]
            personalizacion_nombres = [
                rel.ingrediente.nombre
                for rel in producto.producto_ingrediente
                if rel.ingrediente_id in personalizacion_ids
            ]

            detalle = DetallePedido(
                pedido_id=pedido.id,
                producto_id=producto.id,
                cantidad=item.cantidad,
                nombre=producto.nombre,
                precio=Decimal(str(producto.precio)),
                subtotal=Decimal(str(producto.precio)) * item.cantidad,
                personalizacion=personalizacion_ids,
                personalizacion_nombres=personalizacion_nombres,
            )
            pedido.detalles.append(detalle)

            producto.stock_cantidad -= item.cantidad

            # Descuenta stock de cada ingrediente usado, salvo el que se sacó
            for rel in producto.producto_ingrediente:
                if rel.ingrediente_id in personalizacion_ids:
                    continue
                rel.ingrediente.stock_cantidad -= float(rel.cantidad) * item.cantidad

            subtotal += detalle.subtotal

        descuento = Decimal("2.50") if subtotal > 15 else Decimal("0")
        costo_envio = Decimal("1.99") if (direccion_id is not None and subtotal > 0) else Decimal("0")

        pedido.subtotal = subtotal
        pedido.descuento = descuento
        pedido.costo_envio = costo_envio
        pedido.total = subtotal - descuento + costo_envio

    await ws_manager.broadcast(
        {
            "pedido_id": pedido.id,
            "usuario_id": pedido.usuario_id,
            "estado_codigo": pedido.estado_codigo,
            "total": float(pedido.total),
        },
        "pedido_nuevo",
    )

    init_point = None
    if data.forma_pago == FormaPago.MERCADO_PAGO:
        preference_data = {
            "items": [{"title": f"Pedido #{pedido.id}", "quantity": 1, "unit_price": float(pedido.total)}],
            "back_urls": {
                # TODO: reemplazar por la URL real del front en cada ambiente
                "success": "https://xvcrkf3s-5173.brs.devtunnels.ms/",
                "failure": "https://xvcrkf3s-5173.brs.devtunnels.ms/",
                "pending": "https://xvcrkf3s-5173.brs.devtunnels.ms/",
            },
            "auto_return": "approved",
            "external_reference": str(pedido.id),
            "notification_url": f"{settings.MP_URL}/pagos/crear",
        }
        resultado = crear_preferencia(preference_data)
        init_point = resultado.get("init_point")

    return pedido, init_point


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
                producto = uow.productos.get_by_id(detalle.producto_id)
                if producto:
                    producto.stock_cantidad += detalle.cantidad
                for link in uow.producto_ingredientes.get_by_producto(detalle.producto_id):
                    if link.ingrediente_id in detalle.personalizacion:
                        continue  # ese ingrediente no se había descontado, no se restaura
                    ingrediente = uow.ingredientes.get_by_id(link.ingrediente_id)
                    if ingrediente:
                        ingrediente.stock_cantidad += float(link.cantidad) * detalle.cantidad

        uow.historial.add(HistorialEstadoPedido(
            pedido_id=pedido.id,
            estado_desde_id=estado_actual,
            estado_hacia_id=destino,
            usuario_id=actor_id,
        ))

        return pedido