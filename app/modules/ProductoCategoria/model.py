from typing import Optional
from sqlmodel import SQLModel, Field, Relationship


class ProductoCategoria(SQLModel, table=True):
    producto_id: Optional[int] = Field(default=None, foreign_key="producto.id", primary_key=True)
    categoria_id: Optional[int] = Field(default=None, foreign_key="categoria.id", primary_key=True)
