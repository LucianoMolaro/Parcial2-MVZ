from typing import List
from fastapi import HTTPException
from sqlmodel import Session, select

from app.core.UnitOfWork import UnitOfWork
from app.modules.Rol.model import Rol
from app.modules.Usuario.model import Usuario
from app.modules.UsuarioRol.model import UsuarioRol
from app.modules.UsuarioRol.schema import AsignarRolRequest


def get_roles_de_usuario(session: Session, usuario_id: int) -> List[UsuarioRol]:
    if not session.get(Usuario, usuario_id):
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return session.exec(select(UsuarioRol).where(UsuarioRol.usuario_id == usuario_id)).all()


def asignar_rol(session: Session, usuario_id: int, data: AsignarRolRequest, _: int) -> UsuarioRol:
    with UnitOfWork(session) as uow:
        if not uow._session.get(Usuario, usuario_id):
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        if not uow._session.get(Rol, data.rol_codigo):
            raise HTTPException(status_code=404, detail="Rol no encontrado")
        existing = uow._session.exec(
            select(UsuarioRol).where(
                UsuarioRol.usuario_id == usuario_id,
                UsuarioRol.rol_codigo == data.rol_codigo,
            )
        ).first()
        if existing:
            raise HTTPException(status_code=409, detail="El usuario ya tiene ese rol")
        ur = UsuarioRol(usuario_id=usuario_id, rol_codigo=data.rol_codigo)
        uow._session.add(ur)
        uow._session.flush()
        return ur


def revocar_rol(session: Session, usuario_id: int, rol_codigo: str) -> None:
    with UnitOfWork(session) as uow:
        ur = uow._session.exec(
            select(UsuarioRol).where(
                UsuarioRol.usuario_id == usuario_id,
                UsuarioRol.rol_codigo == rol_codigo,
            )
        ).first()
        if not ur:
            raise HTTPException(status_code=404, detail="Asignación no encontrada")
        uow._session.delete(ur)
        uow._session.flush()
