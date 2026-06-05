from typing import TYPE_CHECKING, Optional
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

    categorias: list["Categoria"] = Relationship(
        back_populates="productos", link_model=ProductoCategoria
    )
    ingrediente_links: list["ProductoIngrediente"] = Relationship(back_populates="producto")
    detalles: list["DetallePedido"] = Relationship(back_populates="producto")
