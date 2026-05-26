# Registra todos los modelos en SQLAlchemy antes de configurar los mappers
from app.modules.Usuario.model import Usuario  # noqa
from app.modules.Rol.model import Rol  # noqa
from app.modules.UsuarioRol.model import UsuarioRol  # noqa
from app.modules.Categoria.model import Categoria  # noqa
from app.modules.ProductoCategoria.model import ProductoCategoria  # noqa
from app.modules.Ingrediente.model import Ingrediente  # noqa
from app.modules.ProductoIngrediente.model import ProductoIngrediente  # noqa
from app.modules.Producto.model import Producto  # noqa
from app.modules.DireccionEntrega.model import DireccionEntrega  # noqa
from app.modules.EstadoPedido.model import EstadoPedido  # noqa
from app.modules.FormaPago.model import FormaPago  # noqa
from app.modules.Pedido.model import Pedido  # noqa
from app.modules.DetallePedido.model import DetallePedido  # noqa
from app.modules.HistorialDetallePedido.model import HistorialDetallePedido  # noqa