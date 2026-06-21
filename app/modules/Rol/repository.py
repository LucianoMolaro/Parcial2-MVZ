from sqlmodel import Session, select

from app.core.Repository import Repository
from app.modules.Rol.model import Rol


class RolRepository(Repository[Rol]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Rol)

    def listar(self):
        return self._session.exec(select(Rol)).all()
