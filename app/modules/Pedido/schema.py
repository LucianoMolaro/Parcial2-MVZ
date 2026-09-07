from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import List, Optional
from sqlmodel import SQLModel

from app.modules.DireccionEntrega.schema import DireccionRead
from app.modules.FormaPago.model import FormaPago
from app.modules.Producto.schema import ProductoCarrito


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
    direccion: Optional[int] = None  # None = retiro en el local
    forma_pago: FormaPago


class PedidoCambiarEstado(SQLModel):
    estado_pedido_codigo: str
    motivo: Optional[str] = None


class PedidoRead(SQLModel):
    id: int
    usuario_id: int
    forma_pago_codigo: str
    direccion_entrega: Optional[DireccionRead] = None
    estado_codigo: str
    subtotal: Decimal
    costo_envio: Decimal
    total: Decimal
    notas: Optional[str] = None
    created_at: Optional[datetime] = None
    detalles: list[DetallePedidoRead]
    init_point: Optional[str] = None