from decimal import Decimal
from typing import TYPE_CHECKING, List, Optional
from sqlmodel import Field, Relationship, SQLModel


from app.modules.DetallePedido.model import DetallePedido
from app.modules.EstadoPedido.model import EstadoPedido
from app.modules.FormaPago.model import FormaPago
from app.modules.Usuario.model import Usuario


class Pedido(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id")
    forma_pago_codigo: str = Field(foreign_key="formapago.codigo", max_length=20)
    direccion_entrega_id: int = Field(foreign_key="direccionentrega.id")
    estado_pedido_codigo: str = Field(foreign_key="estadopedido.codigo", max_length=20)
    subtotal: Decimal = Field(max_digits=10, decimal_places=2)
    costo_envio: Decimal = Field(max_digits=10, decimal_places=2, default=50)
    total: Decimal = Field(max_digits=10, decimal_places=2)
    notas: Optional[str] = Field(default=None)

    usuario: Optional["Usuario"] = Relationship(back_populates="pedidos")
    forma_pago: Optional["FormaPago"] = Relationship(back_populates="pedidos")
    direccion_entrega: Optional["DireccionEntrega"] = Relationship(back_populates="pedidos")
    estado_pedido: Optional["EstadoPedido"] = Relationship(back_populates="pedidos")
    detalles: list["DetallePedido"] = Relationship(back_populates="pedido")
    historial: list["HistorialDetallePedido"] = Relationship(back_populates="pedido")
