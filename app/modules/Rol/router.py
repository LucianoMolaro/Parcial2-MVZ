from fastapi import APIRouter, Depends

from app.core.deps import get_uow, require_role
from app.core.UnitOfWork import UnitOfWork
from app.modules.Rol.model import Rol

router = APIRouter(prefix="/roles", tags=["Roles"])


@router.get("/", response_model=list[Rol])
def listar_roles(
    uow: UnitOfWork = Depends(get_uow),
    _=Depends(require_role(["ADMIN"])),
):
    return uow.roles.listar()
