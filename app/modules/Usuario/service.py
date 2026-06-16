# from typing import List, Optional
# from fastapi import Depends, HTTPException
# from sqlmodel import Session, select

# from app.core.Database import get_session
# from app.core.Security import hash_password
# from app.core.UnitOfWork import UnitOfWork
# from app.modules.Rol.model import Rol
# from app.modules.Usuario.model import Usuario
# from app.modules.Usuario.schema import UsuarioCreate, UsuarioRead, UsuarioUpdate
# from app.modules.UsuarioRol.model import UsuarioRol



# def get_all(offset: int, limit: int, session= SesDep) -> list[Usuario]:
#     query = select(Usuario).where(Usuario.habilitado == True)
#     # if rol:
#     #     query = query.join(UsuarioRol).where(UsuarioRol.rol_codigo == rol)
#     return session.exec(query.offset(offset).limit(limit)).all()

# def get_by_id(usuario_id: int, session = SesDep) -> Usuario:
#     u = session.get(Usuario, usuario_id)
#     if not u:
#         raise HTTPException(status_code=404, detail="Usuario no encontrado")
#     return u

# def get_by_username(username: str, session = SesDep) -> Usuario | None:
#     return session.exec(select(Usuario).where(Usuario.username == username)).first()

from fastapi import HTTPException
from sqlmodel import select

from app.core.Security import hash_password
from app.core.UnitOfWork import UnitOfWork
from app.modules.Usuario.model import Usuario
from app.modules.Usuario.schema import UsuarioCreate, UsuarioRead


def registrar(data: UsuarioCreate, uow: UnitOfWork) -> UsuarioRead:
    if len(data.password) < 8:
        raise HTTPException(400, "La contraseña debe tener al menos 8 caracteres")
    
    password_hash = hash_password(data.password)
    usuario = Usuario(
        nombre=data.nombre,
        apellido=data.apellido,
        email=data.email,
        celular=data.celular,
        username=data.username,
        password_hash=password_hash,
    )
    if uow.usuarios.get_by_username(data.username):
        raise HTTPException(400, "El nombre de usuario ya existe")

    if uow.usuarios.get_by_email(data.email):
        raise HTTPException(400, "El email ya está registrado")
    
    with uow:
        return uow.usuarios.add(usuario)

        
        

# def update(usuario_id: int, data: UsuarioUpdate, session = SesDep) -> Usuario:
#     with UnitOfWork(session) as uow:
#         u = uow._session.get(Usuario, usuario_id)
#         if not u:
#             raise HTTPException(status_code=404, detail="Usuario no encontrado")
#         for field, value in data.model_dump(exclude_none=True).items():
#             setattr(u, field, value)
#         uow._session.flush()
#         return u

# def delete(usuario_id: int, session = SesDep) -> None:
#     with UnitOfWork(session) as uow:
#         u = uow._session.get(Usuario, usuario_id)
#         if not u:
#             raise HTTPException(status_code=404, detail="Usuario no encontrado")
#         u.deleted = True
#         uow._session.flush()

