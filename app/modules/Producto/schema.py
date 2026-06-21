from typing import List, Optional
from sqlmodel import SQLModel

from app.modules.Categoria.schema import CategoriaRead


class ProductoIngredienteRead(SQLModel):
    ingrediente_id: int
    nombre: str
    unidad_medida_id: int
    es_alergeno: bool
    stock_cantidad: float
    cantidad: float


class ProductoCreate(SQLModel):
    nombre: str
    precio: float
    descripcion: Optional[str] = None
    disponible: bool = True
    stock_cantidad: int = 0
    categoria_ids: List[int] = []
    ingredientes: List["ProductoIngredienteInput"] = []


class ProductoIngredienteInput(SQLModel):
    ingrediente_id: int
    cantidad: float


class ProductoDisponibilidadUpdate(SQLModel):
    stock_cantidad: int
    disponible: bool


class ProductoRead(SQLModel):
    id: int
    nombre: str
    precio: float
    descripcion: Optional[str] = None
    imagen_url: Optional[str] = None
    disponible: bool
    stock_cantidad: int
    categorias: List[CategoriaRead] = []
    ingredientes: List[ProductoIngredienteRead] = []
