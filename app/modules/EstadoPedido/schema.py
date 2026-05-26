from sqlmodel import SQLModel


class EstadoPedidoCreate(SQLModel):
    codigo: str
    descripcion: str
    orden: int
    es_terminal: bool


class EstadoPedidoRead(SQLModel):
    codigo: str
    descripcion: str
    orden: int
    es_terminal: bool
