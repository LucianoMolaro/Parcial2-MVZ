from typing import List, Optional
from sqlmodel import Session, select

from app.core.Repository import Repository
from app.modules.FormaPago.model import FormaPago


class FormaPagoRepository(Repository[FormaPago]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, FormaPago)

    def get_habilitadas(self) -> List[FormaPago]:
        return self._session.exec(select(FormaPago).where(FormaPago.habilitado == True)).all()

    def get_habilitada(self, codigo: str) -> Optional[FormaPago]:
        fp = self.get_by_id(codigo)
        return fp if fp and fp.habilitado else None
