from sqlmodel import SQLModel

class DetalleCreate(SQLModel):
    cantidad: int
    personalizacion: list[int]