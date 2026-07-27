from typing import List, Optional
from fastapi import HTTPException

from app.core.UnitOfWork import UnitOfWork
from app.modules.Cloudinary.service import upload_image
from app.modules.Ingrediente.model import Ingrediente
from app.modules.Ingrediente.schema import IngredienteCreate, IngredienteSchema, IngredienteUpdate
from app.modules.UnidadMedida.schema import UnidadMedidaSchema


def get_all(uow: UnitOfWork) -> list[IngredienteSchema]:
    uow.ingredientes.get_all()
    return  uow.ingredientes.get_all()


def get_by_id(uow: UnitOfWork, ingrediente_id: int) -> IngredienteSchema:
    ing = uow.ingredientes.get_by_id(ingrediente_id)
    if not ing:
        raise HTTPException(status_code=404, detail="Ingrediente no encontrado")
    return ing


def update(uow: UnitOfWork, data: IngredienteUpdate) -> IngredienteSchema:
    with uow:
        ing = uow.ingredientes.get_by_id(data.id)
        if not ing:
            raise HTTPException(status_code=404, detail="Ingrediente no encontrado")

        unidad = uow.unidades_medida.get_by_id(data.unidad_medida_id)
        if not unidad:
            raise HTTPException(status_code=404, detail="Unidad de medida no encontrada")

        ing.nombre = data.nombre
        ing.es_alergeno = data.es_alergeno
        ing.stock_cantidad = data.stock_cantidad
        ing.unidad_medida_id = data.unidad_medida_id

    return ing


def create(uow: UnitOfWork, data: IngredienteCreate) -> IngredienteSchema:
    data.nombre = data.nombre.strip()

    if not data.nombre:
        raise HTTPException(status_code=400, detail="El nombre es obligatorio")

    if data.unidad_medida_id is None:
        raise HTTPException(status_code=400, detail="Debe seleccionar una unidad de medida")

    if uow.ingredientes.get_by_nombre(data.nombre):
        raise HTTPException(status_code=400, detail="Ya existe un ingrediente con ese nombre")

    unidad = uow.unidades_medida.get_by_id(data.unidad_medida_id)
    if not unidad:
        raise HTTPException(status_code=404, detail="Unidad de medida no encontrada")
    with uow:
        nuevo_ingrediente = Ingrediente(
            nombre=data.nombre,
            es_alergeno=data.es_alergeno,
            stock_cantidad=data.stock_cantidad,
            unidad_medida_id=data.unidad_medida_id,
        )
        creado = uow.ingredientes.add(nuevo_ingrediente)

    return creado


def delete(uow: UnitOfWork, ingrediente_id: int) -> None:
    with uow:
        ing = uow.ingredientes.get_by_id(ingrediente_id)
        if not ing:
            raise HTTPException(status_code=404, detail="Ingrediente no encontrado")
        uow.ingredientes.delete(ing)
