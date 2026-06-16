from typing import Optional
from sqlmodel import Session, select

from app.core.Repository import Repository
from app.modules.Pago.model import Pago


class PagoRepository(Repository[Pago]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Pago)

    def get_by_mp_payment_id(self, mp_payment_id: int) -> Optional[Pago]:
        return self._session.exec(
            select(Pago).where(Pago.mp_payment_id == mp_payment_id)
        ).first()

    def get_by_pedido(self, pedido_id: int) -> Optional[Pago]:
        return self._session.exec(
            select(Pago).where(Pago.pedido_id == pedido_id)
        ).first()
