from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select

from app.core.deps import get_uow, require_role
from app.core.UnitOfWork import UnitOfWork
from app.modules.Rol.model import Rol
from app.modules.Usuario.model import Usuario
from app.modules.UsuarioRol.model import UsuarioRol

router = APIRouter(prefix="/usuarios-roles", tags=["UsuarioRol"])


@router.post("/{usuario_id}/{rol_codigo}", status_code=201)
def asignar_rol(
    usuario_id: int,
    rol_codigo: str,
    uow: UnitOfWork = Depends(get_uow),
    _=Depends(require_role(["ADMIN"])),
):
    if not uow._session.get(Usuario, usuario_id):
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    if not uow._session.get(Rol, rol_codigo):
        raise HTTPException(status_code=404, detail="Rol no encontrado")
    existente = uow._session.exec(
        select(UsuarioRol)
        .where(UsuarioRol.usuario_id == usuario_id, UsuarioRol.rol_codigo == rol_codigo)
    ).first()
    if existente:
        raise HTTPException(status_code=409, detail="El usuario ya tiene ese rol")
    with uow:
        uow._session.add(UsuarioRol(usuario_id=usuario_id, rol_codigo=rol_codigo))
    return {"detail": "Rol asignado"}


@router.delete("/{usuario_id}/{rol_codigo}", status_code=204)
def quitar_rol(
    usuario_id: int,
    rol_codigo: str,
    uow: UnitOfWork = Depends(get_uow),
    _=Depends(require_role(["ADMIN"])),
):
    link = uow._session.exec(
        select(UsuarioRol)
        .where(UsuarioRol.usuario_id == usuario_id, UsuarioRol.rol_codigo == rol_codigo)
    ).first()
    if not link:
        raise HTTPException(status_code=404, detail="Relación no encontrada")
    with uow:
        uow._session.delete(link)
