from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional
from sqlmodel import Field, Relationship, SQLModel



if TYPE_CHECKING:
    from app.modules.Categoria.model import Categoria
    from app.modules.DetallePedido.model import DetallePedido
    from app.modules.Ingrediente.model import Ingrediente
    from app.modules.ProductoCategoria.model import ProductoCategoria
    from app.modules.ProductoIngrediente.model import ProductoIngrediente


class Producto(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    #Atributos
    nombre: str
    precio: float
    descripcion: Optional[str] = None
    imagen_url: Optional[str] = None
    disponible: bool = Field(default=True)
    stock_cantidad: int = Field(default=0)
    habilitado: bool = Field(default=True)

    #Audit
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc),sa_column_kwargs={"onupdate": lambda: datetime.now(timezone.utc)})

    #Relaciones
    producto_categoria: list["ProductoCategoria"] = Relationship(back_populates="producto")
    producto_ingrediente: list["ProductoIngrediente"] = Relationship(back_populates="producto")
    detalles: list["DetallePedido"] = Relationship(back_populates="producto")
