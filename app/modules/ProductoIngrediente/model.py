from decimal import Decimal
from typing import TYPE_CHECKING, Optional
from sqlmodel import Field, Relationship, SQLModel



if TYPE_CHECKING:
    from app.modules.Ingrediente.model import Ingrediente
    from app.modules.Producto.model import Producto
    from app.modules.Categoria.model import Categoria


class ProductoIngrediente(SQLModel, table=True):
    producto_id: Optional[int] = Field(default=None, foreign_key="producto.id", primary_key=True)
    ingrediente_id: Optional[int] = Field(default=None, foreign_key="ingrediente.id", primary_key=True)
    es_removible: bool = Field(default=False)
    cantidad: Decimal = Field(max_length=10, max_digits=3)

    producto: "Producto" = Relationship(back_populates="producto_ingrediente")
    ingrediente: "Ingrediente" = Relationship(back_populates="producto_ingrediente")

    


