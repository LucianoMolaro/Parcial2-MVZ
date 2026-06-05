from decimal import Decimal
from typing import List, Optional
from sqlmodel import SQLModel


class DetallePedidoCreate(SQLModel):
    producto_id: int
    cantidad: int
    personalizacion: Optional[int] = None


class DetallePedidoRead(SQLModel):
    pedido_id: int
    producto_id: int
    cantidad: int
    nombre: str
    precio: Decimal
    subtotal: Decimal
    personalizacion: Optional[int] = None


class DetallePedidoUpdate(SQLModel):
    cantidad: int
    personalizacion: Optional[int] = None


class PedidoCreate(SQLModel):
    forma_pago_codigo: str
    direccion_entrega_id: int
    costo_envio: Decimal = Decimal("0.00")
    notas: Optional[str] = None
    detalles: List[DetallePedidoCreate]


class PedidoCambiarEstado(SQLModel):
    estado_pedido_codigo: str
    motivo: Optional[str] = None


class PedidoRead(SQLModel):
    id: int
    usuario_id: int
    forma_pago_codigo: str
    direccion_entrega_id: int
    estado_codigo: str
    subtotal: Decimal
    costo_envio: Decimal
    total: Decimal
    notas: Optional[str] = None
    detalles: List[DetallePedidoRead] = []
