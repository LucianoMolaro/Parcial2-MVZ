from datetime import datetime, timezone
from decimal import Decimal
from typing import TYPE_CHECKING, List, Optional
from sqlmodel import Field, Relationship, SQLModel

from app.modules.Producto.model import Producto
from app.modules.UnidadMedida.model import UnidadMedida

if TYPE_CHECKING:
    from app.modules.ProductoIngrediente.model import ProductoIngrediente


class Ingrediente(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    #Atributos
    nombre: str
    precio: Decimal = Field(max_digits=10, decimal_places=2)
    es_alergeno: bool = Field(default=False)
    es_removible: bool = Field(default=False)
    stock_cantidad: Decimal = Field(max_digits=10, decimal_places=2)
    unidad_medida_id: int = Field(foreign_key="unidadmedida.id")


    #Audit 
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc),sa_column_kwargs={"onupdate": lambda: datetime.now(timezone.utc)})

    #Relaciones
    producto_ingrediente: list["ProductoIngrediente"] = Relationship(back_populates="ingrediente")
    unidad_medida: UnidadMedida = Relationship()
    
