from fastapi import APIRouter, Depends
from sqlmodel import select

from app.core.deps import get_current_active_user, get_uow
from app.core.UnitOfWork import UnitOfWork
from app.modules.UnidadMedida.model import UnidadMedida

router = APIRouter(prefix="/unidades-medida", tags=["UnidadMedida"])


@router.get("/", response_model=list[UnidadMedida])
def listar_unidades(
    uow: UnitOfWork = Depends(get_uow),
    _=Depends(get_current_active_user),
):
    return uow._session.exec(select(UnidadMedida)).all()
