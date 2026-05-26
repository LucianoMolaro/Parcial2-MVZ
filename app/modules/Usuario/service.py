from typing import List, Optional
from fastapi import HTTPException
from sqlmodel import Session, select

from app.core.Security import hash_password
from app.core.UnitOfWork import UnitOfWork
from app.modules.Usuario.model import Usuario
from app.modules.Usuario.schema import UsuarioCreate, UsuarioUpdate
from app.modules.UsuarioRol.model import UsuarioRol


def get_all(session: Session, rol: Optional[str], offset: int, limit: int) -> List[Usuario]:
    query = select(Usuario).where(Usuario.deleted == False)
    if rol:
        query = query.join(UsuarioRol).where(UsuarioRol.rol_codigo == rol)
    return session.exec(query.offset(offset).limit(limit)).all()


def get_by_id(session: Session, usuario_id: int) -> Usuario:
    u = session.get(Usuario, usuario_id)
    if not u:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return u


def create(session: Session, data: UsuarioCreate) -> Usuario:
    with UnitOfWork(session) as uow:
        if uow._session.exec(select(Usuario).where(Usuario.email == data.email)).first():
            raise HTTPException(status_code=409, detail="El email ya está en uso")
        if uow._session.exec(select(Usuario).where(Usuario.username == data.username)).first():
            raise HTTPException(status_code=409, detail="El username ya está en uso")
        usuario = Usuario(
            nombre=data.nombre, apellido=data.apellido, email=data.email,
            celular=data.celular, username=data.username, password=hash_password(data.password),
        )
        uow._session.add(usuario)
        uow._session.flush()
        return usuario


def update(session: Session, usuario_id: int, data: UsuarioUpdate) -> Usuario:
    with UnitOfWork(session) as uow:
        u = uow._session.get(Usuario, usuario_id)
        if not u:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        for field, value in data.model_dump(exclude_none=True).items():
            setattr(u, field, value)
        uow._session.flush()
        return u


def delete(session: Session, usuario_id: int) -> None:
    with UnitOfWork(session) as uow:
        u = uow._session.get(Usuario, usuario_id)
        if not u:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        u.deleted = True
        uow._session.flush()
