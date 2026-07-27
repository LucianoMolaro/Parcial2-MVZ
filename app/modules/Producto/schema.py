from typing import List, Optional
from sqlmodel import SQLModel

from app.modules.Categoria.schema import CategoriaSchema
from app.modules.ProductoIngrediente.schema import ProductoIngredienteRead

class ProductoCarrito(SQLModel):
    id: int
    cantidad: int
    personalizacion: list[int]


class ProductoIngredienteInput(SQLModel):
    ingrediente_id: int
    cantidad: float


class ProductoDisponibilidadUpdate(SQLModel):
    stock_cantidad: int
    disponible: bool


class ProductoCreate(SQLModel):
    nombre: str
    precio: float
    descripcion: Optional[str] = None
    disponible: bool = True
    stock_cantidad: int = 0
    categoria_ids: list[int] = []
    ingredientes: list[ProductoIngredienteInput] = []


class ProductoSchema(SQLModel):
    id: int
    nombre: str
    precio: float
    descripcion: str | None = None
    disponible: bool
    stock_cantidad: int
    habilitado: bool
    imagenes_url: list[str] = []
    categorias: list[CategoriaSchema] = []
    ingredientes: list[ProductoIngredienteRead] = []
