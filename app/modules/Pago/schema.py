from decimal import Decimal
from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel


class PreferenciaRead(SQLModel):
    preference_id: str
    init_point: str


class PagoRead(SQLModel):
    id: int
    mp_payment_id: Optional[int]
    mp_status: str
    mp_status_detail: Optional[str]
    transaction_amount: Decimal
    pedido_id: int
    created_at: datetime

class PagoCreate(SQLModel):
    mp_payment_id: int
    mp_status: str
    mp_status_detail: str
    external_reference: str
    transaction_amount: Decimal
    payment_method_id: str


