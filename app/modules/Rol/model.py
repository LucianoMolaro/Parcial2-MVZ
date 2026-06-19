from typing import TYPE_CHECKING, List, Optional
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.Usuario.model import Usuario

from app.modules.UsuarioRol.model import UsuarioRol


class Rol(SQLModel, table=True):
    codigo: str = Field(max_length=20, primary_key=True)
    nombre: str = Field(max_length=50, unique=True)
    descripcion: Optional[str] = None

