from fastapi import APIRouter, Depends

from app.core.deps import get_uow, require_role
from app.core.UnitOfWork import UnitOfWork
from app.modules.UsuarioRol import service as usuario_rol_service

router = APIRouter(prefix="/usuarios-roles", tags=["UsuarioRol"])


@router.post("/{usuario_id}/{rol_codigo}", status_code=201)
def asignar_rol(
    usuario_id: int,
    rol_codigo: str,
    uow: UnitOfWork = Depends(get_uow),
    _=Depends(require_role(["ADMIN"])),
):
    return usuario_rol_service.asignar_rol(uow, usuario_id, rol_codigo)


@router.delete("/{usuario_id}/{rol_codigo}", status_code=204)
def quitar_rol(
    usuario_id: int,
    rol_codigo: str,
    uow: UnitOfWork = Depends(get_uow),
    _=Depends(require_role(["ADMIN"])),
):
    usuario_rol_service.quitar_rol(uow, usuario_id, rol_codigo)
