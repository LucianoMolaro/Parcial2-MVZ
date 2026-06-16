from fastapi import Depends
from sqlmodel import Session

from app.core.Database import get_session
from app.modules.Categoria.repository import CategoriaRepository
from app.modules.DetallePedido.repository import DetallePedidoRepository
from app.modules.DireccionEntrega.repository import DireccionEntregaRepository
from app.modules.EstadoPedido.repository import EstadoPedidoRepository
from app.modules.FormaPago.repository import FormaPagoRepository
from app.modules.HistorialEstadoPedido.repository import HistorialEstadoPedidoRepository
from app.modules.Ingrediente.repository import IngredienteRepository
from app.modules.Pago.repository import PagoRepository
from app.modules.Pedido.repository import PedidoRepository
from app.modules.Producto.repository import ProductoRepository
from app.modules.ProductoCategoria.repository import ProductoCategoriaRepository
from app.modules.ProductoIngrediente.repository import ProductoIngredienteRepository
from app.modules.Rol.repository import RolRepository
from app.modules.UnidadMedida.repository import UnidadMedidaRepository
from app.modules.Usuario.repository import UsuarioRepository
from app.modules.UsuarioRol.repository import UsuarioRolRepository


class UnitOfWork:

    def __init__(self, session: Session) -> None:
        self._session = session

        self.usuarios = UsuarioRepository(self._session)
        self.pedidos = PedidoRepository(self._session)
        self.categoria = CategoriaRepository(self._session)
        self.direcciones = DireccionEntregaRepository(self._session)
        self.ingredientes = IngredienteRepository(self._session)
        self.productos = ProductoRepository(self._session)
        self.roles = RolRepository(self._session)
        self.formas_pago = FormaPagoRepository(self._session)
        self.estados_pedido = EstadoPedidoRepository(self._session)
        self.unidades_medida = UnidadMedidaRepository(self._session)
        self.usuario_roles = UsuarioRolRepository(self._session)
        self.producto_categorias = ProductoCategoriaRepository(self._session)
        self.producto_ingredientes = ProductoIngredienteRepository(self._session)
        self.detalles = DetallePedidoRepository(self._session)
        self.historial = HistorialEstadoPedidoRepository(self._session)
        self.pagos = PagoRepository(self._session)

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
