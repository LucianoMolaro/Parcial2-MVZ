from decimal import Decimal
from typing import List

from fastapi import HTTPException
from sqlmodel import Session, select

from app.core.UnitOfWork import UnitOfWork
from app.modules.DetallePedido.model import DetallePedido
from app.modules.Pedido.model import Pedido
from app.modules.Producto.model import Producto
from app.modules.Pedido.schema import DetallePedidoUpdate


def _verificar_pedido_editable(session: Session, pedido_id: int) -> Pedido:
    pedido = session.get(Pedido, pedido_id)
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    if pedido.estado_pedido_codigo != "PENDIENTE":
        raise HTTPException(
            status_code=409,
            detail="Solo se pueden modificar detalles de pedidos en estado PENDIENTE",
        )
    return pedido


def _recalcular_totales(session: Session, pedido: Pedido) -> None:
    detalles = session.exec(
        select(DetallePedido).where(DetallePedido.pedido_id == pedido.id)
    ).all()
    subtotal = sum(d.subtotal for d in detalles)
    pedido.subtotal = subtotal
    pedido.total = subtotal + pedido.costo_envio


def get_by_pedido(session: Session, pedido_id: int) -> List[DetallePedido]:
    if not session.get(Pedido, pedido_id):
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    return session.exec(
        select(DetallePedido).where(DetallePedido.pedido_id == pedido_id)
    ).all()


def update(session: Session, pedido_id: int, detalle_id: int, data: DetallePedidoUpdate) -> DetallePedido:
    with UnitOfWork(session) as uow:
        pedido = _verificar_pedido_editable(uow._session, pedido_id)
        detalle = uow._session.get(DetallePedido, detalle_id)
        if not detalle or detalle.pedido_id != pedido_id:
            raise HTTPException(status_code=404, detail="Detalle no encontrado")

        detalle.cantidad = data.cantidad
        detalle.personalizacion = data.personalizacion
        detalle.subtotal = detalle.precio * data.cantidad

        _recalcular_totales(uow._session, pedido)
        uow._session.flush()
        return detalle


def delete(session: Session, pedido_id: int, detalle_id: int) -> None:
    with UnitOfWork(session) as uow:
        pedido = _verificar_pedido_editable(uow._session, pedido_id)
        detalle = uow._session.get(DetallePedido, detalle_id)
        if not detalle or detalle.pedido_id != pedido_id:
            raise HTTPException(status_code=404, detail="Detalle no encontrado")

        uow._session.delete(detalle)
        uow._session.flush()
        _recalcular_totales(uow._session, pedido)
        uow._session.flush()
