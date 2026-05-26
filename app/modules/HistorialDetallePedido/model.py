from datetime import datetime
from typing import TYPE_CHECKING, Optional
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.EstadoPedido.model import EstadoPedido
    from app.modules.Pedido.model import Pedido


class HistorialDetallePedido(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    pedido_id: int = Field(foreign_key="pedido.id")
    estado_codigo: str = Field(foreign_key="estadopedido.codigo", max_length=20)
    changed_by_id: int = Field(foreign_key="usuario.id")
    motivo: Optional[str] = Field(default=None)
    fecha: datetime = Field(default_factory=datetime.now)

    pedido: Optional["Pedido"] = Relationship(back_populates="historial")
    estado: Optional["EstadoPedido"] = Relationship(back_populates="historial")
