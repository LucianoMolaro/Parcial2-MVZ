from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel


class HistorialRead(SQLModel):
    id: int
    pedido_id: int
    estado_codigo: str
    changed_by_id: int
    motivo: Optional[str] = None
    fecha: datetime
