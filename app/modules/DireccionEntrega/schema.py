from typing import Optional
from sqlmodel import SQLModel


class DireccionCreate(SQLModel):
    alias: Optional[str] = "Direccion #"
    calle: str
    altura: str
    ciudad: str
    provincia: Optional[str] = None
    codigo_postal: Optional[str] = None
    es_principal: bool = False


class DireccionRead(SQLModel):
    id: int
    alias: str
    calle: str
    altura: str
    ciudad: str
    provincia: Optional[str] = None
    es_principal: bool = False
