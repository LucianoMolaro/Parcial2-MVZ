from typing import List
from sqlmodel import Session, select

from app.core.Repository import Repository
from app.modules.UnidadMedida.model import UnidadMedida


class UnidadMedidaRepository(Repository[UnidadMedida]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, UnidadMedida)

    def listar(self) -> List[UnidadMedida]:
        return self._session.exec(select(UnidadMedida)).all()
