from sqlmodel import Session

from app.core.Repository import Repository
from app.modules.Pedido.model import Pedido


class PedidoRepository(Repository[Pedido]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Pedido)