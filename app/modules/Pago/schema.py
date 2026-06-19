from decimal import Decimal
from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class PreferenciaResponse(BaseModel):
    checkout_url: str
    pedido_id: int


class PagoRead(BaseModel):
    id: int
    mp_payment_id: Optional[int]
    mp_status: str
    mp_status_detail: Optional[str]
    transaction_amount: Decimal
    pedido_id: int
    created_at: datetime
