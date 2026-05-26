from typing import Optional

from sqlmodel import SQLModel


class RolCreate(SQLModel):
    codigo: str
    nombre: str
    descripcion: Optional[str] = None


class RolRead(SQLModel):
    codigo: str
    nombre: str
    descripcion: Optional[str] = None
