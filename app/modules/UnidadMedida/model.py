from datetime import datetime, timezone
from typing import Optional

from sqlmodel import BigInteger, Field, SQLModel


class UnidadMedida(SQLModel, table=True):
    id: Optional[int] = Field(default=None,primary_key=True, sa_type=BigInteger)
    nombre: str = Field(max_length=50, unique=True)
    simbolo: str = Field(max_length=10, unique=True)
    tipo: str = Field(max_length=20)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))