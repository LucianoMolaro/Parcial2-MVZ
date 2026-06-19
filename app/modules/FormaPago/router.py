from fastapi import APIRouter, Depends

from app.core.deps import get_current_active_user, get_uow
from app.core.UnitOfWork import UnitOfWork
from app.modules.FormaPago.model import FormaPago

router = APIRouter(prefix="/formas-pago", tags=["FormaPago"])


@router.get("/", response_model=list[FormaPago])
def listar_formas_pago(
    uow: UnitOfWork = Depends(get_uow),
    _=Depends(get_current_active_user),
):
    return uow.formas_pago.get_habilitadas()
