from typing import TYPE_CHECKING, Optional
from sqlmodel import Field, Relationship, SQLModel



class ProductoIngrediente(SQLModel, table=True):
    producto_id: Optional[int] = Field(default=None, foreign_key="producto.id", primary_key=True)
    ingrediente_id: Optional[int] = Field(default=None, foreign_key="ingrediente.id", primary_key=True)
    cantidad: float  # cantidad de este ingrediente que usa UNA unidad del producto

    producto: Optional["Producto"] = Relationship(back_populates="ingrediente_links")
    ingrediente: Optional["Ingrediente"] = Relationship(back_populates="producto_links")
