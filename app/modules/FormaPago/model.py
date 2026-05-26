from typing import TYPE_CHECKING, List
from sqlmodel import Field, Relationship, SQLModel


class FormaPago(SQLModel, table=True):
    codigo: str = Field(max_length=20, primary_key=True)
    descripcion: str = Field(max_length=80)
    habilitado: bool = Field(default=True)

    pedidos: List["Pedido"] = Relationship(back_populates="forma_pago")
