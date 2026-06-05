from typing import TYPE_CHECKING, Optional, List
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.HistorialEstadoPedido.model import HistorialEstadoPedido
    from app.modules.Pedido.model import Pedido


class EstadoPedido(SQLModel, table=True):
    codigo: Optional[str] = Field(default=None, primary_key=True, max_length=20)
    descripcion: str = Field(max_length=80)
    orden: int
    es_terminal: bool

    historial_desde: List["HistorialEstadoPedido"] = Relationship(
        back_populates="estado_desde",
        sa_relationship_kwargs={
            "foreign_keys": "[HistorialEstadoPedido.estado_desde_id]"
        }
    )
    historial_hacia: List["HistorialEstadoPedido"] = Relationship(
        back_populates="estado_hacia",
        sa_relationship_kwargs={
            "foreign_keys": "[HistorialEstadoPedido.estado_hacia_id]"
        }
    )
    pedidos: List["Pedido"] = Relationship(back_populates="estado_pedido")
