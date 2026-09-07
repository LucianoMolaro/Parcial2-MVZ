from datetime import datetime, timezone
from typing import TYPE_CHECKING, List, Optional
from sqlalchemy.orm import selectinload
from sqlmodel import BigInteger, Column, DateTime, Field, ForeignKey, Relationship, SQLModel, String, Text, func

from app.modules.Cloudinary.model import Imagen
from app.modules.ProductoCategoria.model import ProductoCategoria

if TYPE_CHECKING:
    from app.modules.Producto.model import Producto


class Categoria(SQLModel, table=True):
    __tablename__ = "categoria"
    id: Optional[int] = Field(default=None,sa_column=Column(BigInteger, primary_key=True, autoincrement=True))

    #Atributos
    nombre: str = Field(sa_column=Column(String(100), unique=True, nullable=False))
    descripcion: Optional[str] = Field(default=None)
    parent_id: Optional[int] = Field(default=None,sa_column=Column(BigInteger, ForeignKey("categoria.id"), nullable=True))
    imagen_url: str = Field(default=None, sa_column=Column(Text, nullable=True))
    cloudinary_id: int = Field(default=None, foreign_key="imagen.id")

    cloudinary: Imagen = Relationship()
    habilitado: bool = Field(default=True)
    


    #Audit
    created_at: datetime = Field(sa_column=Column(DateTime(timezone=True), nullable=False, server_default=func.now()))
    updated_at: datetime = Field(sa_column=Column(DateTime(timezone=True),nullable=False,server_default=func.now(),onupdate=func.now()))
    deleted_at: Optional[datetime] = Field(default=None, sa_column=Column(DateTime(timezone=True), nullable=True))
    
    #Relaciones
    subcategorias: List["Categoria"] = Relationship(
        back_populates="parent",
        sa_relationship_kwargs={
            "foreign_keys": "[Categoria.parent_id]",
            # "lazy": "raise",
        },
    )
    
    
    parent: Optional["Categoria"] = Relationship(
        back_populates="subcategorias",
        sa_relationship_kwargs={
            "foreign_keys": "[Categoria.parent_id]",
            "remote_side": "[Categoria.id]",
        },
    )
    
    producto_categoria: list["ProductoCategoria"] = Relationship(back_populates="categoria")
