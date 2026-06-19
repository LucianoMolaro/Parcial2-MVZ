from datetime import datetime, timezone
from typing import TYPE_CHECKING, List, Optional
from sqlmodel import Field, Relationship, SQLModel

from app.modules.Producto.model import Producto

if TYPE_CHECKING:
    from app.modules.ProductoIngrediente.model import ProductoIngrediente


class Ingrediente(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    #Atributos
    nombre: str
    es_alergeno: bool = Field(default=False)
    stock_cantidad: float = Field(default=0)
    unidad_medida_id: int = Field(foreign_key="unidadmedida.id")


    #Audit 
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc),sa_column_kwargs={"onupdate": lambda: datetime.now(timezone.utc)})

    #Relaciones
    producto_ingrediente: list["ProductoIngrediente"] = Relationship(back_populates="ingrediente")
    
