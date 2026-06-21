from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from app.modules.Categoria.model import Categoria
    from app.modules.Producto.model import Producto


class ProductoCategoria(SQLModel, table=True):
    producto_id: Optional[int] = Field(default=None, foreign_key="producto.id", primary_key=True)
    categoria_id: Optional[int] = Field(default=None, foreign_key="categoria.id", primary_key=True)
    es_principal: bool = Field(default=False)

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    producto: "Producto" = Relationship(back_populates="producto_categoria")
    categoria: "Categoria" = Relationship(back_populates="producto_categoria")