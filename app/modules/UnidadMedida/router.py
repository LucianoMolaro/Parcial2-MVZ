from fastapi import APIRouter, Depends

from app.core.deps import get_current_active_user, get_uow, require_role
from app.core.UnitOfWork import UnitOfWork
from app.modules.UnidadMedida.schema import UnidadMedidaSchema

router = APIRouter(prefix="/unidades/medida", tags=["UnidadMedida"])


@router.get("/todas", response_model=list[UnidadMedidaSchema])
def obtener_todas(
    uow: UnitOfWork = Depends(get_uow),
    _=Depends(require_role("ADMIN")),
):
    return uow.unidades_medida.get_all()


@router.get("/xtipo/{tipo}", response_model=list[UnidadMedidaSchema])
def obtener_xtipo(
    tipo: str,
    uow: UnitOfWork = Depends(get_uow),
    _=Depends(require_role("ADMIN")),
):
    return uow.unidades_medida.get_xtipo(tipo)
