from typing import TYPE_CHECKING, List, Optional
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.ProductoIngrediente.model import ProductoIngrediente


class Ingrediente(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str
    unidad: str
    es_alergeno: bool = Field(default=False)
    stock_cantidad: float = Field(default=0) 

    producto_links: List["ProductoIngrediente"] = Relationship(back_populates="ingrediente")
