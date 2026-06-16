from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select

from app.core.deps import get_current_active_user, get_uow, require_role
from app.core.UnitOfWork import UnitOfWork
from app.modules.DetallePedido.model import DetallePedido
from app.modules.Usuario.model import Usuario

router = APIRouter(prefix="/detalles-pedido", tags=["DetallePedido"])


@router.get("/{pedido_id}", response_model=list[DetallePedido])
def listar_detalles(
    pedido_id: int,
    uow: UnitOfWork = Depends(get_uow),
    current_user: Usuario = Depends(get_current_active_user),
):
    detalles = uow._session.exec(
        select(DetallePedido).where(DetallePedido.pedido_id == pedido_id)
    ).all()
    if not detalles:
        raise HTTPException(status_code=404, detail="No se encontraron detalles para ese pedido")
    return detalles
