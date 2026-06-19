from datetime import datetime, timezone
from typing import TYPE_CHECKING, List, Optional
from sqlmodel import Field, Relationship, SQLModel

from app.modules.ProductoCategoria.model import ProductoCategoria

if TYPE_CHECKING:
    from app.modules.Producto.model import Producto


class Categoria(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    #Atributos
    nombre: str = Field(index=True)
    descripcion: Optional[str] = None
    parent_id: Optional[int] = Field(default=None, foreign_key="categoria.id")
    habilitado: bool = Field(default=True)


    #Audit
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc),sa_column_kwargs={"onupdate": lambda: datetime.now(timezone.utc)})

    #Relaciones
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
    producto_categoria: list["ProductoCategoria"] = Relationship(back_populates="categoria")

    