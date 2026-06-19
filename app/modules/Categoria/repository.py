from typing import List, Optional
from sqlmodel import Session, select

from app.core.Repository import Repository
from app.modules.Categoria.model import Categoria


class CategoriaRepository(Repository[Categoria]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Categoria)

    def get_all_filtrado(
        self,
        nombre: Optional[str],
        parent_id: Optional[int],
        offset: int,
        limit: int,
    ) -> List[Categoria]:
        query = select(Categoria).where(Categoria.habilitado == True)
        if nombre:
            query = query.where(Categoria.nombre.contains(nombre))
        if parent_id is not None:
            query = query.where(Categoria.parent_id == parent_id)
        return self._session.exec(query.offset(offset).limit(limit)).all()

    def get_all_habilitadas(self) -> List[Categoria]:
        return self._session.exec(select(Categoria).where(Categoria.habilitado == True)).all()

    def get_habilitada(self, id: int) -> Optional[Categoria]:
        c = self.get_by_id(id)
        return c if c and c.habilitado else None
