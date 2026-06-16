from fastapi import Depends
from sqlmodel import Session

from app.core.Database import get_session
from app.modules.Categoria.repository import CategoriaRepository
from app.modules.Ingrediente.repository import IngredienteRepository
from app.modules.Pedido.repository import PedidoRepository
from app.modules.Producto.repository import ProductoRepository
from app.modules.Usuario.repository import UsuarioRepository
from app.modules.DireccionEntrega.repository import DireccionEntregaRepository


class UnitOfWork:

    def __init__(self, session: Session) -> None:
        self._session = session

        self.usuarios = UsuarioRepository(self._session)
        self.pedidos = PedidoRepository(self._session)
        self.categoria = CategoriaRepository(self._session)
        self.direcciones = DireccionEntregaRepository(self._session)
        self.ingredientes = IngredienteRepository(self._session)
        self.productos = ProductoRepository(self._session)

    def __enter__(self) -> "UnitOfWork":
        return self

    def __exit__(self, exc_type, exc_val, exc_tb) -> None:
        if exc_type is None:
            self._session.commit()
        else:
            self._session.rollback()

    def commit(self) -> None:
        self._session.commit()

    def rollback(self) -> None:
        self._session.rollback()
