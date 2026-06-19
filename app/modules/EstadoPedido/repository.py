from typing import List
from sqlmodel import Session, select

from app.core.Repository import Repository
from app.modules.EstadoPedido.model import EstadoPedido


class EstadoPedidoRepository(Repository[EstadoPedido]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, EstadoPedido)

    def get_all_ordenado(self) -> List[EstadoPedido]:
        return self._session.exec(select(EstadoPedido).order_by(EstadoPedido.orden)).all()
