from typing import List

from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.core.Database import get_session
from app.core.deps import get_current_active_user
from app.modules.Pedido.schema import DetallePedidoRead, DetallePedidoUpdate
from app.modules.DetallePedido import service as detalle_service

router = APIRouter(prefix="/pedidos/{pedido_id}/detalles", tags=["DetallePedido"])


@router.get("/", response_model=List[DetallePedidoRead])
def listar_detalles(
    pedido_id: int,
    session: Session = Depends(get_session),
    _=Depends(get_current_active_user),
):
    return detalle_service.get_by_pedido(session, pedido_id)


@router.put("/{detalle_id}", response_model=DetallePedidoRead)
def editar_detalle(
    pedido_id: int,
    detalle_id: int,
    datos: DetallePedidoUpdate,
    session: Session = Depends(get_session),
    _=Depends(get_current_active_user),
):
    return detalle_service.update(session, pedido_id, detalle_id, datos)


@router.delete("/{detalle_id}", status_code=204)
def eliminar_detalle(
    pedido_id: int,
    detalle_id: int,
    session: Session = Depends(get_session),
    _=Depends(get_current_active_user),
):
    detalle_service.delete(session, pedido_id, detalle_id)
