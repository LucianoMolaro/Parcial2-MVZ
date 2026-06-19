from typing import List
from sqlmodel import Session, select

from app.core.Repository import Repository
from app.modules.ProductoIngrediente.model import ProductoIngrediente


class ProductoIngredienteRepository(Repository[ProductoIngrediente]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, ProductoIngrediente)

    def get_by_producto(self, producto_id: int) -> List[ProductoIngrediente]:
        return self._session.exec(
            select(ProductoIngrediente).where(ProductoIngrediente.producto_id == producto_id)
        ).all()
