from typing import List, Optional
from fastapi import HTTPException
from sqlmodel import Session, select

from app.core.UnitOfWork import UnitOfWork
from app.modules.Ingrediente.model import Ingrediente
from app.modules.Ingrediente.schema import IngredienteCreate


def get_all(session: Session, nombre: Optional[str], es_alergeno: Optional[bool], offset: int, limit: int) -> List[Ingrediente]:
    query = select(Ingrediente)
    if nombre:
        query = query.where(Ingrediente.nombre.contains(nombre))
    if es_alergeno is not None:
        query = query.where(Ingrediente.es_alergeno == es_alergeno)
    return session.exec(query.offset(offset).limit(limit)).all()


def get_by_id(session: Session, ingrediente_id: int) -> Ingrediente:
    ingrediente = session.get(Ingrediente, ingrediente_id)
    if not ingrediente:
        raise HTTPException(status_code=404, detail="Ingrediente no encontrado")
    return ingrediente


def create(session: Session, data: IngredienteCreate) -> Ingrediente:
    with UnitOfWork(session) as uow:
        nuevo = Ingrediente(
            nombre=data.nombre,
            unidad=data.unidad,
            es_alergeno=data.es_alergeno,
            stock_cantidad=data.stock_cantidad,
        )
        uow._session.add(nuevo)
        uow._session.flush()
        return nuevo


def update(session: Session, ingrediente_id: int, data: IngredienteCreate) -> Ingrediente:
    with UnitOfWork(session) as uow:
        ingrediente = uow._session.get(Ingrediente, ingrediente_id)
        if not ingrediente:
            raise HTTPException(status_code=404, detail="Ingrediente no encontrado")
        ingrediente.nombre = data.nombre
        ingrediente.unidad = data.unidad
        ingrediente.es_alergeno = data.es_alergeno
        ingrediente.stock_cantidad = data.stock_cantidad
        uow._session.flush()
        return ingrediente


def delete(session: Session, ingrediente_id: int) -> None:
    with UnitOfWork(session) as uow:
        ingrediente = uow._session.get(Ingrediente, ingrediente_id)
        if not ingrediente:
            raise HTTPException(status_code=404, detail="Ingrediente no encontrado")
        uow._session.delete(ingrediente)
        uow._session.flush()
