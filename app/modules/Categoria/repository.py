from typing import Any, List, Optional
from sqlmodel import Session, select

from app.core.Repository import Repository
from app.modules.Categoria.model import Categoria


class CategoriaRepository(Repository[Categoria]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Categoria)

    def get_principales(self, *expressions: Any) -> List[Categoria]:
        statement = select(self._model)
        if(expressions):
            statement = statement.where(*expressions)
        return self._session.exec(statement).all()

    def get_por_padre(self,  *expressions: Any) -> List[Categoria]:
        statement = select(self._model)
        if(expressions):
            statement = statement.where(*expressions)

        return self._session.exec(statement).all()


    def get_all_habilitadas(self) -> List[Categoria]:
        return self._session.exec(select(Categoria).where(Categoria.habilitado == True)).all()

    def get_habilitada(self, id: int) -> Optional[Categoria]:
        c = self.get_by_id(id)
        return c if c and c.habilitado else None

    def get_by_parent(self, parent_id: Optional[int] = None) -> List[Categoria]:
        stmt = select(Categoria).where(Categoria.parent_id == parent_id)
        return self._session.exec(stmt).all()