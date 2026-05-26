from typing import List

from fastapi import HTTPException
from sqlmodel import Session, select

from app.core.UnitOfWork import UnitOfWork
from app.modules.Rol.model import Rol
from app.modules.Rol.schema import RolCreate


def get_all(session: Session) -> List[Rol]:
    return session.exec(select(Rol)).all()


def get_by_codigo(session: Session, codigo: str) -> Rol:
    rol = session.get(Rol, codigo)
    if not rol:
        raise HTTPException(status_code=404, detail="Rol no encontrado")
    return rol


def create(session: Session, data: RolCreate) -> Rol:
    with UnitOfWork(session) as uow:
        if uow._session.get(Rol, data.codigo):
            raise HTTPException(status_code=409, detail="El código de rol ya existe")
        rol = Rol(codigo=data.codigo, nombre=data.nombre, descripcion=data.descripcion)
        uow._session.add(rol)
        uow._session.flush()
        return rol


def update(session: Session, codigo: str, data: RolCreate) -> Rol:
    with UnitOfWork(session) as uow:
        rol = uow._session.get(Rol, codigo)
        if not rol:
            raise HTTPException(status_code=404, detail="Rol no encontrado")
        rol.nombre = data.nombre
        rol.descripcion = data.descripcion
        uow._session.flush()
        return rol


def delete(session: Session, codigo: str) -> None:
    with UnitOfWork(session) as uow:
        rol = uow._session.get(Rol, codigo)
        if not rol:
            raise HTTPException(status_code=404, detail="Rol no encontrado")
        uow._session.delete(rol)
        uow._session.flush()
