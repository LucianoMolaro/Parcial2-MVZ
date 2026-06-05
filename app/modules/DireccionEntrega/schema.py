from decimal import Decimal
from typing import Optional

from sqlmodel import SQLModel


class DireccionCreate(SQLModel):
    alias: Optional[str] = None
    calle1: str
    calle2: Optional[str] = None
    ciudad: str
    provincia: Optional[str] = None
    codigo_postal: Optional[str] = None
    latitud: Optional[Decimal] = None
    longitud: Optional[Decimal] = None
    es_principal: bool = False


class DireccionRead(SQLModel):
    id: int
    alias: Optional[str] = None
    calle1: str
    calle2: Optional[str] = None
    ciudad: str
    provincia: Optional[str] = None
    codigo_postal: Optional[str] = None
    es_principal: bool = False
    
