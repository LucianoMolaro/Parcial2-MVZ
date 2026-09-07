from decimal import Decimal
from typing import Optional

from sqlmodel import SQLModel

from app.modules.UnidadMedida.schema import UnidadMedidaSchema

class IngredienteCreate(SQLModel):
    nombre: str
    precio: Decimal
    unidad_medida_id: int
    es_alergeno: bool
    stock_cantidad: float

class IngredienteUpdate(SQLModel):
    id: int
    nombre: str
    precio: Decimal
    unidad_medida_id: int
    es_alergeno: bool
    stock_cantidad: float



class IngredienteSchema(SQLModel):
    id: int
    nombre: str
    precio: Decimal
    unidad_medida: UnidadMedidaSchema
    es_alergeno: bool
    stock_cantidad: Decimal
