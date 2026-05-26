from typing import Optional
from sqlmodel import SQLModel


class UsuarioCreate(SQLModel):
    nombre: str
    apellido: str
    email: str
    celular: Optional[str] = None
    username: str
    password: str


class UsuarioUpdate(SQLModel):
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    email: Optional[str] = None
    celular: Optional[str] = None


class UsuarioRead(SQLModel):
    id: int
    nombre: str
    apellido: str
    email: str
    celular: Optional[str] = None
    username: str
    deleted: bool
