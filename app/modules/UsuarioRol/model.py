from typing import TYPE_CHECKING
from sqlmodel import Field, Relationship, SQLModel


# from app.modules.Rol.model import Rol
# from app.modules.Usuario.model import Usuario


class UsuarioRol(SQLModel, table=True):
    usuario_id: int = Field(foreign_key="usuario.id",primary_key=True)
    rol_codigo: str = Field(foreign_key="rol.codigo",primary_key=True)

