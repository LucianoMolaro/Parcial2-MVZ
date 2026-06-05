from typing import TYPE_CHECKING, Optional

from sqlmodel import Field, Relationship,  SQLModel

if TYPE_CHECKING:
    from app.modules.Pedido.model import Pedido


class FormaPago(SQLModel, table=True):
    codigo: str = Field(default=None, primary_key=True, max_length=20)
    descripcion: str = Field(default=None, max_length=80)
    habilitado: bool = Field(default=True)

    pedidos: list["Pedido"] = Relationship(back_populates="forma_pago")