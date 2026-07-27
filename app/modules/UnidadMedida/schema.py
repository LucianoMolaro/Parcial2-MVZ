from datetime import datetime
from sqlmodel import SQLModel


class UnidadMedidaSchema(SQLModel):
    id: int 
    nombre: str 
    simbolo: str
    tipo: str 
