from typing import TYPE_CHECKING, List, Optional
from sqlmodel import Field, Relationship, SQLModel

from app.modules.ProductoCategoria.model import ProductoCategoria

if TYPE_CHECKING:
    from app.modules.Categoria.model import Categoria
    from app.modules.DetallePedido.model import DetallePedido
    from app.modules.ProductoIngrediente.model import ProductoIngrediente


class Producto(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str
    precio: float
    descripcion: Optional[str] = None
    disponible: bool = Field(default=True)
    stock_cantidad: int = Field(default=0)
    deleted: bool = Field(default=False)

    categorias: List["Categoria"] = Relationship(
        back_populates="productos", link_model=ProductoCategoria
    )
    ingrediente_links: List["ProductoIngrediente"] = Relationship(back_populates="producto")
    detalles: List["DetallePedido"] = Relationship(back_populates="producto")
