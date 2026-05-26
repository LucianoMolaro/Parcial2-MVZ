from typing import List

from fastapi import HTTPException
from sqlmodel import Session, select

from app.core.UnitOfWork import UnitOfWork
from app.modules.EstadoPedido.model import EstadoPedido
from app.modules.EstadoPedido.schema import EstadoPedidoCreate


def get_all(session: Session) -> List[EstadoPedido]:
    return session.exec(select(EstadoPedido).order_by(EstadoPedido.orden)).all()


def get_by_codigo(session: Session, codigo: str) -> EstadoPedido:
    estado = session.get(EstadoPedido, codigo)
    if not estado:
        raise HTTPException(status_code=404, detail="Estado de pedido no encontrado")
    return estado


def create(session: Session, data: EstadoPedidoCreate) -> EstadoPedido:
    with UnitOfWork(session) as uow:
        if uow._session.get(EstadoPedido, data.codigo):
            raise HTTPException(status_code=409, detail="El código de estado ya existe")
        estado = EstadoPedido(**data.model_dump())
        uow._session.add(estado)
        uow._session.flush()
        return estado


def update(session: Session, codigo: str, data: EstadoPedidoCreate) -> EstadoPedido:
    with UnitOfWork(session) as uow:
        estado = uow._session.get(EstadoPedido, codigo)
        if not estado:
            raise HTTPException(status_code=404, detail="Estado de pedido no encontrado")
        estado.descripcion = data.descripcion
        estado.orden = data.orden
        estado.es_terminal = data.es_terminal
        uow._session.flush()
        return estado


def delete(session: Session, codigo: str) -> None:
    with UnitOfWork(session) as uow:
        estado = uow._session.get(EstadoPedido, codigo)
        if not estado:
            raise HTTPException(status_code=404, detail="Estado de pedido no encontrado")
        uow._session.delete(estado)
        uow._session.flush()
