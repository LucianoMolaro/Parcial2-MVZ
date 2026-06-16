from typing import List, Optional
from fastapi import HTTPException

from app.core.UnitOfWork import UnitOfWork
from app.modules.Ingrediente.model import Ingrediente
from app.modules.Ingrediente.schema import IngredienteCreate, IngredienteRead, IngredienteUpdate


def _enrich(uow: UnitOfWork, ing: Ingrediente) -> IngredienteRead:
    read = IngredienteRead.model_validate(ing)
    unidad = uow.unidades_medida.get_by_id(ing.unidad_medida_id)
    if unidad:
        read.unidad_medida_nombre = unidad.nombre
        read.unidad_medida_simbolo = unidad.simbolo
    return read


def get_all(uow: UnitOfWork, nombre: Optional[str], es_alergeno: Optional[bool], offset: int, limit: int) -> List[IngredienteRead]:
    ingredientes = uow.ingredientes.get_all_filtrado(nombre, es_alergeno, offset, limit)
    return [_enrich(uow, ing) for ing in ingredientes]


def get_by_id(uow: UnitOfWork, ingrediente_id: int) -> IngredienteRead:
    ing = uow.ingredientes.get_by_id(ingrediente_id)
    if not ing:
        raise HTTPException(status_code=404, detail="Ingrediente no encontrado")
    return _enrich(uow, ing)


def create(uow: UnitOfWork, data: IngredienteCreate) -> IngredienteRead:
    if not uow.unidades_medida.get_by_id(data.unidad_medida_id):
        raise HTTPException(status_code=404, detail="Unidad de medida no encontrada")
    with uow:
        nuevo = Ingrediente(
            nombre=data.nombre,
            unidad_medida_id=data.unidad_medida_id,
            es_alergeno=data.es_alergeno,
            stock_cantidad=data.stock_cantidad,
        )
        uow.ingredientes.add(nuevo)
        return _enrich(uow, nuevo)


def update(uow: UnitOfWork, ingrediente_id: int, data: IngredienteUpdate) -> IngredienteRead:
    with uow:
        ing = uow.ingredientes.get_by_id(ingrediente_id)
        if not ing:
            raise HTTPException(status_code=404, detail="Ingrediente no encontrado")
        ing.nombre = data.nombre
        ing.es_alergeno = data.es_alergeno
        ing.stock_cantidad = data.stock_cantidad
        return _enrich(uow, ing)


def delete(uow: UnitOfWork, ingrediente_id: int) -> None:
    with uow:
        ing = uow.ingredientes.get_by_id(ingrediente_id)
        if not ing:
            raise HTTPException(status_code=404, detail="Ingrediente no encontrado")
        uow.ingredientes.delete(ing)
