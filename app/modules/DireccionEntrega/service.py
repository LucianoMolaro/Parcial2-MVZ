from typing import List
from fastapi import HTTPException
from sqlmodel import select

from app.core.UnitOfWork import UnitOfWork
from app.modules.DireccionEntrega.model import DireccionEntrega
from app.modules.DireccionEntrega.schema import DireccionCreate


def get_all(uow: UnitOfWork, usuario_id: int) -> List[DireccionEntrega]:
    return uow._session.exec(
        select(DireccionEntrega).where(
            DireccionEntrega.usuario_id == usuario_id,
            DireccionEntrega.habilitado == True,
        )
    ).all()


def get_by_id(uow: UnitOfWork, direccion_id: int) -> DireccionEntrega:
    d = uow._session.get(DireccionEntrega, direccion_id)
    if not d or not d.habilitado:
        raise HTTPException(status_code=404, detail="Dirección no encontrada")
    return d


def create(uow: UnitOfWork, usuario_id: int, data: DireccionCreate) -> DireccionEntrega:
    with uow:
        direccion = DireccionEntrega(usuario_id=usuario_id, **data.model_dump())
        uow._session.add(direccion)
        uow._session.flush()
        return direccion


def update(uow: UnitOfWork, direccion_id: int, usuario_id: int, data: DireccionCreate) -> DireccionEntrega:
    with uow:
        d = uow._session.get(DireccionEntrega, direccion_id)
        if not d or not d.habilitado:
            raise HTTPException(status_code=404, detail="Dirección no encontrada")
        if d.usuario_id != usuario_id:
            raise HTTPException(status_code=403, detail="Sin permiso sobre esta dirección")
        for field, value in data.model_dump().items():
            setattr(d, field, value)
        uow._session.flush()
        return d


def set_principal(uow: UnitOfWork, direccion_id: int, usuario_id: int) -> DireccionEntrega:
    with uow:
        d = uow._session.get(DireccionEntrega, direccion_id)
        if not d or not d.habilitado:
            raise HTTPException(status_code=404, detail="Dirección no encontrada")
        if d.usuario_id != usuario_id:
            raise HTTPException(status_code=403, detail="Sin permiso sobre esta dirección")
        otras = uow._session.exec(
            select(DireccionEntrega).where(
                DireccionEntrega.usuario_id == usuario_id,
                DireccionEntrega.es_principal == True,
            )
        ).all()
        for otra in otras:
            otra.es_principal = False
        d.es_principal = True
        uow._session.flush()
        return d


def delete(uow: UnitOfWork, direccion_id: int, usuario_id: int) -> None:
    with uow:
        d = uow._session.get(DireccionEntrega, direccion_id)
        if not d or not d.habilitado:
            raise HTTPException(status_code=404, detail="Dirección no encontrada")
        if d.usuario_id != usuario_id:
            raise HTTPException(status_code=403, detail="Sin permiso sobre esta dirección")
        d.habilitado = False
        uow._session.flush()
