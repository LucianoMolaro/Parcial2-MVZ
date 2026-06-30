from decimal import Decimal
from enum import Enum
from typing import List, Optional
from sqlmodel import SQLModel

from app.modules.DireccionEntrega.schema import DireccionRead
from app.modules.Producto.schema import ProductoCarrito


class FormaPago(str, Enum):
    EFECTIVO = "EFECTIVO"
    MERCADO_PAGO = "MERCADOPAGO"


class DetallePedidoRead(SQLModel):
    pedido_id: int
    producto_id: int
    cantidad: int
    nombre: str
    precio: Decimal
    subtotal: Decimal
    personalizacion_nombres: list[str] = []


class DetallePedidoUpdate(SQLModel):
    cantidad: int
    personalizacion: Optional[int] = None


class PedidoCreate(SQLModel):
    productos: list[ProductoCarrito]
    direccion: int
    forma_pago: FormaPago


class PedidoCambiarEstado(SQLModel):
    estado_pedido_codigo: str
    motivo: Optional[str] = None


class PedidoRead(SQLModel):
    id: int
    usuario_id: int
    forma_pago_codigo: str
    direccion: DireccionRead
    estado_codigo: str
    subtotal: Decimal
    costo_envio: Decimal
    total: Decimal
    notas: Optional[str] = None
    created_at: Optional[str] = None
    detalles: list[DetallePedidoRead]