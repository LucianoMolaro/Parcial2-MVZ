from fastapi import APIRouter, Depends
from sqlmodel import select

from app.core.deps import get_current_active_user, get_uow
from app.core.UnitOfWork import UnitOfWork
from app.modules.EstadoPedido.model import EstadoPedido

router = APIRouter(prefix="/estados-pedido", tags=["EstadoPedido"])


@router.get("/", response_model=list[EstadoPedido])
def listar_estados(
    uow: UnitOfWork = Depends(get_uow),
    _=Depends(get_current_active_user),
):
    return uow._session.exec(select(EstadoPedido).order_by(EstadoPedido.orden)).all()
