from sqlmodel import Session

from app.core.Repository import Repository
from app.modules.Producto.model import Producto


class ProductoRepository(Repository[Producto]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Producto)

        