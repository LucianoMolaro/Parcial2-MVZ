from typing import TYPE_CHECKING, List
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.Pedido.model import Pedido


class FormaPago(SQLModel, table=True):
    codigo: str = Field(max_length=20, primary_key=True)
    descripcion: str = Field(max_length=80)
    habilitado: bool = Field(default=True)

    pedidos: List["Pedido"] = Relationship(back_populates="forma_pago")
