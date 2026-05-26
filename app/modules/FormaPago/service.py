from typing import List

from fastapi import HTTPException
from sqlmodel import Session, select

from app.core.UnitOfWork import UnitOfWork
from app.modules.FormaPago.model import FormaPago
from app.modules.FormaPago.schema import FormaPagoCreate


def get_all(session: Session) -> List[FormaPago]:
    return session.exec(select(FormaPago)).all()


def get_by_codigo(session: Session, codigo: str) -> FormaPago:
    fp = session.get(FormaPago, codigo)
    if not fp:
        raise HTTPException(status_code=404, detail="Forma de pago no encontrada")
    return fp


def create(session: Session, data: FormaPagoCreate) -> FormaPago:
    with UnitOfWork(session) as uow:
        if uow._session.get(FormaPago, data.codigo):
            raise HTTPException(status_code=409, detail="El código de forma de pago ya existe")
        fp = FormaPago(**data.model_dump())
        uow._session.add(fp)
        uow._session.flush()
        return fp


def update(session: Session, codigo: str, data: FormaPagoCreate) -> FormaPago:
    with UnitOfWork(session) as uow:
        fp = uow._session.get(FormaPago, codigo)
        if not fp:
            raise HTTPException(status_code=404, detail="Forma de pago no encontrada")
        fp.descripcion = data.descripcion
        fp.habilitado = data.habilitado
        uow._session.flush()
        return fp


def delete(session: Session, codigo: str) -> None:
    """Delete lógico: deshabilita la forma de pago."""
    with UnitOfWork(session) as uow:
        fp = uow._session.get(FormaPago, codigo)
        if not fp:
            raise HTTPException(status_code=404, detail="Forma de pago no encontrada")
        fp.habilitado = False
        uow._session.flush()
