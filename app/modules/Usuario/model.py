from typing import TYPE_CHECKING, List, Optional
from sqlmodel import Field, Relationship, SQLModel

from app.modules.DireccionEntrega.model import DireccionEntrega
from app.modules.Rol.model import Rol
from app.modules.UsuarioRol.model import UsuarioRol


class Usuario(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(max_length=80)
    apellido: str = Field(max_length=80)
    email: str = Field(unique=True, max_length=254)
    celular: Optional[str] = Field(default=None, max_length=20)
    username: str = Field(unique=True)
    password: str = Field(max_length=60)
    deleted: bool = Field(default=False)

    roles: List["Rol"] = Relationship(back_populates="usuarios", link_model=UsuarioRol)
    direcciones: List["DireccionEntrega"] = Relationship(back_populates="usuario")
    pedidos: List["Pedido"] = Relationship(back_populates="usuario")
