from typing import TYPE_CHECKING, List
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.HistorialDetallePedido.model import HistorialDetallePedido
    from app.modules.Pedido.model import Pedido


class EstadoPedido(SQLModel, table=True):
    codigo: str = Field(max_length=20, primary_key=True)
    descripcion: str = Field(max_length=80)
    orden: int
    es_terminal: bool

    pedidos: List["Pedido"] = Relationship(back_populates="estado_pedido")
    historial: List["HistorialDetallePedido"] = Relationship(back_populates="estado")
