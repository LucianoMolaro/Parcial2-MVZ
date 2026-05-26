from sqlmodel import SQLModel


class FormaPagoCreate(SQLModel):
    codigo: str
    descripcion: str
    habilitado: bool = True


class FormaPagoRead(SQLModel):
    codigo: str
    descripcion: str
    habilitado: bool
