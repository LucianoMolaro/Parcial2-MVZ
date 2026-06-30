from datetime import datetime, timezone
from decimal import Decimal
from typing import TYPE_CHECKING, List, Optional
from sqlmodel import Field, Relationship, SQLModel

from app.modules.EstadoPedido.model import EstadoPedido
from app.modules.FormaPago.model import FormaPago
from app.modules.Pago.model import Pago
if TYPE_CHECKING:
    from app.modules.DetallePedido.model import DetallePedido
    from app.modules.DireccionEntrega.model import DireccionEntrega

    from app.modules.HistorialEstadoPedido.model import HistorialEstadoPedido
    from app.modules.Usuario.model import Usuario


class Pedido(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    usuario_id: int = Field(foreign_key="usuario.id")
    forma_pago_codigo: str = Field(foreign_key="formapago.codigo", max_length=20)
    direccion_entrega_id: int = Field(foreign_key="direccionentrega.id")
    estado_codigo: str = Field(foreign_key="estadopedido.codigo", max_length=20)

    subtotal: Decimal = Field(max_digits=10, decimal_places=2)
    descuento: Decimal = Field(max_digits=10, decimal_places=2, default=0)
    costo_envio: Decimal = Field(max_digits=10, decimal_places=2, default=50)
    total: Decimal = Field(max_digits=10, decimal_places=2)
    notas: Optional[str] = Field(default=None)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    pago: Pago = Relationship(
    back_populates="pedido",  
    sa_relationship_kwargs={
        "cascade": "all, delete-orphan",
        "lazy": "selectin"
    })
    usuario: Optional["Usuario"] = Relationship(back_populates="pedidos")
    forma_pago: Optional["FormaPago"] = Relationship()
    direccion_entrega: Optional["DireccionEntrega"] = Relationship(back_populates="pedidos")
    estado_pedido: Optional["EstadoPedido"] = Relationship()
    detalles: list["DetallePedido"] = Relationship(
        back_populates="pedido",
        sa_relationship_kwargs={
            "cascade": "all, delete-orphan",
            "lazy": "selectin"
        }
    )
    historial: list["HistorialEstadoPedido"] = Relationship(
        back_populates="pedido",
        sa_relationship_kwargs={
            "cascade": "all, delete-orphan",
            "lazy": "selectin"
        }
    )
    