from typing import List, Optional
from sqlmodel import SQLModel


class CategoriaCreate(SQLModel):
    nombre: str
    descripcion: Optional[str] = None
    parent_id: Optional[int] = None


class CategoriaRead(SQLModel):
    id: int
    nombre: str
    descripcion: Optional[str] = None
    parent_id: Optional[int] = None


class CategoriaTree(SQLModel):
    id: int
    nombre: str
    descripcion: Optional[str] = None
    parent_id: Optional[int] = None
    subcategorias: List["CategoriaTree"] = []


CategoriaTree.model_rebuild()
