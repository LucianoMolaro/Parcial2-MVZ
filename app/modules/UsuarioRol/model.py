from typing import TYPE_CHECKING, Optional
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.Usuario.model import Usuario
    from app.modules.Rol.model import Rol


class UsuarioRol(SQLModel, table=True):
    usuario_id: Optional[int] = Field(default=None, foreign_key="usuario.id", primary_key=True)
    rol_codigo: Optional[str] = Field(default=None, foreign_key="rol.codigo", primary_key=True)

    usuario: Optional["Usuario"] = Relationship(back_populates="usuario_roles")
    rol: Optional["Rol"] = Relationship(back_populates="usuario_roles")
