from fastapi import HTTPException

from app.core.UnitOfWork import UnitOfWork
from app.modules.UsuarioRol.model import UsuarioRol


def asignar_rol(uow: UnitOfWork, usuario_id: int, rol_codigo: str) -> dict:
    if not uow.usuarios.get_by_id(usuario_id):
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    if not uow.roles.get_by_id(rol_codigo):
        raise HTTPException(status_code=404, detail="Rol no encontrado")
    if uow.usuario_roles.get_by_usuario_y_rol(usuario_id, rol_codigo):
        raise HTTPException(status_code=409, detail="El usuario ya tiene ese rol")
    with uow:
        uow.usuario_roles.add(UsuarioRol(usuario_id=usuario_id, rol_codigo=rol_codigo))
    return {"detail": "Rol asignado"}


def quitar_rol(uow: UnitOfWork, usuario_id: int, rol_codigo: str) -> None:
    link = uow.usuario_roles.get_by_usuario_y_rol(usuario_id, rol_codigo)
    if not link:
        raise HTTPException(status_code=404, detail="Relación no encontrada")
    with uow:
        uow.usuario_roles.delete(link)
