from sqlmodel import Session

from app.core.Repository import Repository
from app.modules.HistorialEstadoPedido.model import HistorialEstadoPedido


class HistorialEstadoPedidoRepository(Repository[HistorialEstadoPedido]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, HistorialEstadoPedido)
