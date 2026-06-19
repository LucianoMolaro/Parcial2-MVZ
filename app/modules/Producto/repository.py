from typing import List, Optional
from sqlmodel import Session, select

from app.core.Repository import Repository
from app.modules.Producto.model import Producto


class ProductoRepository(Repository[Producto]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Producto)

    def get_productos_filtrado(self, es_admin: bool, offset: int, limit: int) -> List[Producto]:
        if es_admin:
            query = select(Producto).offset(offset).limit(limit)
        else:
            query = (
                select(Producto)
                .where(Producto.habilitado == True, Producto.disponible == True)
                .offset(offset)
                .limit(limit)
            )
        return self._session.exec(query).all()

    def get_habilitado(self, id: int) -> Optional[Producto]:
        p = self.get_by_id(id)
        return p if p and p.habilitado else None
