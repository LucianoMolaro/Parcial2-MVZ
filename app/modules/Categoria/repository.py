from typing import Optional, List
from sqlmodel import Session, select
from app.core.Repository import Repository
from app.modules.Categoria.model import Categoria


class CategoriaRepository(Repository[Categoria]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Categoria)

    def get_by_nombre(self, nombre: str, offset: int, limit: int) -> List[Categoria]:
        query = select(Categoria).where(Categoria.nombre.contains(nombre))
        return self._session.exec(query.offset(offset).limit(limit)).all()
