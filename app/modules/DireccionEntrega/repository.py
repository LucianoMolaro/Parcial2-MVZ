from sqlmodel import Session

from app.core.Repository import Repository
from app.modules.DireccionEntrega.model import DireccionEntrega



class DireccionEntregaRepository(Repository[DireccionEntrega]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, DireccionEntrega)