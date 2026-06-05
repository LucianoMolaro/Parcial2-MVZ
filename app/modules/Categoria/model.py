from typing import TYPE_CHECKING, List, Optional
from sqlmodel import Field, Relationship, SQLModel

from app.modules.ProductoCategoria.model import ProductoCategoria

if TYPE_CHECKING:
    from app.modules.Producto.model import Producto


class Categoria(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(index=True)
    descripcion: Optional[str] = None
    parent_id: Optional[int] = Field(default=None, foreign_key="categoria.id")
    habilitado: bool = Field(default=True)

    subcategorias: List["Categoria"] = Relationship(
        back_populates="parent",
        sa_relationship_kwargs={
            "foreign_keys": "[Categoria.parent_id]",
            "lazy": "selectin",
        },
    )
    parent: Optional["Categoria"] = Relationship(
        back_populates="subcategorias",
        sa_relationship_kwargs={
            "foreign_keys": "[Categoria.parent_id]",
            "remote_side": "[Categoria.id]",
        },
    )
    
    productos: List["Producto"] = Relationship(
        back_populates="categorias", link_model=ProductoCategoria
    )
