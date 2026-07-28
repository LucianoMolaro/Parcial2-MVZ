from typing import List, Optional
from sqlmodel import SQLModel


class CategoriaCreate(SQLModel):
    nombre: str
    descripcion: str | None = None
    parent_id: int | None = None
    imagen_url: str | None = None
    habilitado: bool = True

class CategoriaSchema(CategoriaCreate):
    id: int
    imagen_url: str | None = None
    subcategorias: list["CategoriaSchema"] = []