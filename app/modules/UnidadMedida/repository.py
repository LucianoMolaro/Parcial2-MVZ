from sqlmodel import Session, select

from app.core.Repository import Repository
from app.modules.UnidadMedida.model import UnidadMedida


class UnidadMedidaRepository(Repository[UnidadMedida]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, UnidadMedida)

    def get_xtipo(self, tipo: str):
        return self._session.exec(select(UnidadMedida).where(UnidadMedida.tipo == tipo)).all()
