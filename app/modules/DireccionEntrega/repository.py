from typing import List, Optional
from sqlmodel import Session, select

from app.core.Repository import Repository
from app.modules.DireccionEntrega.model import DireccionEntrega


class DireccionEntregaRepository(Repository[DireccionEntrega]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, DireccionEntrega)

    def get_by_usuario(self, usuario_id: int) -> List[DireccionEntrega]:
        return self._session.exec(
            select(DireccionEntrega).where(
                DireccionEntrega.usuario_id == usuario_id,
                DireccionEntrega.habilitado == True,
            )
        ).all()

    def get_principales_by_usuario(self, usuario_id: int) -> List[DireccionEntrega]:
        return self._session.exec(
            select(DireccionEntrega).where(
                DireccionEntrega.usuario_id == usuario_id,
                DireccionEntrega.es_principal == True,
            )
        ).all()

    def get_habilitada(self, id: int) -> Optional[DireccionEntrega]:
        d = self.get_by_id(id)
        return d if d and d.habilitado else None
