from typing import List
from fastapi import HTTPException
from sqlmodel import Session, select

from app.core.UnitOfWork import UnitOfWork
from app.modules.DireccionEntrega.model import DireccionEntrega
from app.modules.DireccionEntrega.schema import DireccionCreate


def get_all(session: Session, usuario_id: int) -> List[DireccionEntrega]:
    return session.exec(
        select(DireccionEntrega).where(
            DireccionEntrega.usuario_id == usuario_id,
            DireccionEntrega.deleted == False,
        )
    ).all()


def get_by_id(session: Session, direccion_id: int) -> DireccionEntrega:
    d = session.get(DireccionEntrega, direccion_id)
    if not d or d.deleted:
        raise HTTPException(status_code=404, detail="Dirección no encontrada")
    return d


def create(session: Session, usuario_id: int, data: DireccionCreate) -> DireccionEntrega:
    with UnitOfWork(session) as uow:
        direccion = DireccionEntrega(usuario_id=usuario_id, **data.model_dump())
        uow._session.add(direccion)
        uow._session.flush()
        return direccion


def update(session: Session, direccion_id: int, usuario_id: int, data: DireccionCreate) -> DireccionEntrega:
    with UnitOfWork(session) as uow:
        d = uow._session.get(DireccionEntrega, direccion_id)
        if not d or d.deleted:
            raise HTTPException(status_code=404, detail="Dirección no encontrada")
        if d.usuario_id != usuario_id:
            raise HTTPException(status_code=403, detail="Sin permiso sobre esta dirección")
        for field, value in data.model_dump().items():
            setattr(d, field, value)
        uow._session.flush()
        return d


def set_principal(session: Session, direccion_id: int, usuario_id: int) -> DireccionEntrega:
    with UnitOfWork(session) as uow:
        d = uow._session.get(DireccionEntrega, direccion_id)
        if not d or d.deleted:
            raise HTTPException(status_code=404, detail="Dirección no encontrada")
        if d.usuario_id != usuario_id:
            raise HTTPException(status_code=403, detail="Sin permiso sobre esta dirección")
        # Desmarcar todas las demás
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


def delete(session: Session, direccion_id: int, usuario_id: int) -> None:
    with UnitOfWork(session) as uow:
        d = uow._session.get(DireccionEntrega, direccion_id)
        if not d or d.deleted:
            raise HTTPException(status_code=404, detail="Dirección no encontrada")
        if d.usuario_id != usuario_id:
            raise HTTPException(status_code=403, detail="Sin permiso sobre esta dirección")
        d.deleted = True
        uow._session.flush()
