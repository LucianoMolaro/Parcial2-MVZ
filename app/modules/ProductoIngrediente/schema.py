from decimal import Decimal
from sqlmodel import SQLModel


class ProductoIngredienteRead(SQLModel):
    ingrediente_id: int
    nombre: str
    es_removible: bool
    cantidad: Decimal