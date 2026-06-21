from typing import Optional
from sqlmodel import SQLModel

from app.modules.DireccionEntrega.model import DireccionEntrega
from app.modules.DireccionEntrega.schema import DireccionRead
from app.modules.Rol.model import Rol


class UsuarioLogin(SQLModel):
    username: str
    password: str

class UsuarioRead(SQLModel):
    id: int
    nombre: str
    apellido: str
    email: str
    celular: Optional[str] = None
    username: str
    habilitado: bool
    direcciones: list[DireccionRead]
    roles: list[Rol]

class UsuarioCreate(SQLModel):
    nombre: str
    apellido: str
    email: str
    celular: str | None = None
    username: str
    password: str


class UsuarioUpdate(SQLModel):
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    email: Optional[str] = None
    celular: Optional[str] = None
