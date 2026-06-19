from typing import List, Optional
from sqlmodel import Session, select

from app.core.Repository import Repository
from app.modules.ProductoCategoria.model import ProductoCategoria


class ProductoCategoriaRepository(Repository[ProductoCategoria]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, ProductoCategoria)

    def get_by_producto(self, producto_id: int) -> List[ProductoCategoria]:
        return self._session.exec(
            select(ProductoCategoria).where(ProductoCategoria.producto_id == producto_id)
        ).all()

    def get_by_categoria(self, categoria_id: int) -> Optional[ProductoCategoria]:
        return self._session.exec(
            select(ProductoCategoria).where(ProductoCategoria.categoria_id == categoria_id)
        ).first()
