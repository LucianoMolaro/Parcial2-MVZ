from typing import List
from sqlmodel import Session, select

from app.core.Repository import Repository
from app.modules.DetallePedido.model import DetallePedido


class DetallePedidoRepository(Repository[DetallePedido]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, DetallePedido)

    def get_by_pedido(self, pedido_id: int) -> List[DetallePedido]:
        return self._session.exec(
            select(DetallePedido).where(DetallePedido.pedido_id == pedido_id)
        ).all()
