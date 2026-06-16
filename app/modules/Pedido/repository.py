from typing import List, Optional
from sqlmodel import Session, select

from app.core.Repository import Repository
from app.modules.Pedido.model import Pedido


class PedidoRepository(Repository[Pedido]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Pedido)

    def get_all_filtrado(
        self, usuario_id: Optional[int], offset: int, limit: int
    ) -> List[Pedido]:
        query = select(Pedido)
        if usuario_id is not None:
            query = query.where(Pedido.usuario_id == usuario_id)
        return self._session.exec(query.offset(offset).limit(limit)).all()
