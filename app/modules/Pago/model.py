from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional

from sqlmodel import BigInteger, DateTime, Field, SQLModel

class Pago(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True, sa_type=BigInteger)

    mp_payment_id: Optional[int] = Field(unique=True, default=None) 
    mp_status: str = Field(max_length=30)
    mp_status_detail: Optional[str] = Field(max_length=100)
    external_reference: str = Field(max_length=100, unique=True)
    idemponcy_key: str = Field(max_length=100, unique=True)
    transaction_amount: Decimal = Field(max_digits=10, decimal_places=2)
    payment_method_id: Optional[str] = Field(max_length=50)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc),sa_column_kwargs={"onupdate": lambda: datetime.now(timezone.utc)})

    pedido_id: int = Field(foreign_key="pedido.id", sa_type=BigInteger)