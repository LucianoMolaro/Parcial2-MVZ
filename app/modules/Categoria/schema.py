from typing import List, Optional
from sqlmodel import Field, SQLModel
from app.modules.Cloudinary.model import Imagen
from app.modules.Cloudinary.schema import CloudinaryRead


class CategoriaCreate(SQLModel):
    nombre: str
    descripcion: Optional[str] = None
    parent_id: int | None = None
    cloudinary: CloudinaryRead


class CategoriaRead(SQLModel):
    id: int
    nombre: str
    cloudinary: Imagen
    descripcion: str 
    habilitado: bool
    parent_id: Optional[int] = None
    subcategorias: list["CategoriaRead"] = Field(default_factory=list)

    
