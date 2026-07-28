from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional
from sqlmodel import JSON, Column, Field, Relationship, SQLModel


if TYPE_CHECKING:
    from app.modules.DetallePedido.model import DetallePedido
    from app.modules.ProductoCategoria.model import ProductoCategoria
    from app.modules.ProductoIngrediente.model import ProductoIngrediente
    from app.modules.Categoria.model import Categoria


class Producto(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    #Atributos
    nombre: str
    precio: float
    descripcion: Optional[str] = None

    disponible: bool = Field(default=True)
    stock_cantidad: int = Field(default=0)
    habilitado: bool = Field(default=True)
    imagenes_url: list[str] = Field(default=[], sa_column=Column(JSON))


    #Audit
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc),sa_column_kwargs={"onupdate": lambda: datetime.now(timezone.utc)})

    #Relaciones
    producto_categoria: list["ProductoCategoria"] = Relationship(back_populates="producto")
    producto_ingrediente: list["ProductoIngrediente"] = Relationship(back_populates="producto")
    detalles: list["DetallePedido"] = Relationship(back_populates="producto")

    # Propiedades calculadas: traducen las tablas intermedias a la forma
    # que espera ProductoSchema, así el service no necesita un _cargar()
    # manual: solo agrega/retorna el Producto y esto lo arma solo.
    @property
    def categorias(self) -> list["Categoria"]:
        return [link.categoria for link in self.producto_categoria]

    @property
    def ingredientes(self) -> list[dict]:
        return [
            {
                "ingrediente_id": link.ingrediente_id,
                "nombre": link.ingrediente.nombre,
                "unidad_medida_id": link.ingrediente.unidad_medida_id,
                "es_alergeno": link.ingrediente.es_alergeno,
                "stock_cantidad": link.ingrediente.stock_cantidad,
                "es_removible": link.es_removible,
                "cantidad": float(link.cantidad),
            }
            for link in self.producto_ingrediente
        ]