from typing import List, Optional

from sqlmodel import Session, select

from app.core.Repository import Repository
from app.modules.Producto.model import Producto


class ProductoRepository(Repository[Producto]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Producto)

    def get_by_ids(self, ids: list[int]) -> list[Producto]:
        statement = select(Producto).where(Producto.id.in_(ids))
        return self._session.exec(statement).all()

    def get_habilitado(self, id: int) -> Optional[Producto]:
        p = self.get_by_id(id)
        return p if p and p.habilitado else None

    def get_productos_filtrado(self, es_admin: bool, offset: int, limit: int) -> List[Producto]:
        query = select(Producto)
        if not es_admin:
            query = query.where(Producto.habilitado == True)
        return self._session.exec(query.offset(offset).limit(limit)).all()
