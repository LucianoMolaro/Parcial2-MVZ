from sqlmodel import Session, select

from app.core.Database import engine
from app.core.Security import hash_password
from app.modules.EstadoPedido.model import EstadoPedido
from app.modules.FormaPago.model import FormaPago
from app.modules.Rol.model import Rol
from app.modules.UnidadMedida.model import UnidadMedida
from app.modules.Usuario.model import Usuario
from app.modules.UsuarioRol.model import UsuarioRol


ROLES = [
    Rol(codigo="ADMIN",   nombre="Administrador", descripcion="CRUD completo de todo el sistema"),
    Rol(codigo="STOCK",   nombre="Gestor de Stock", descripcion="Actualiza stock y disponibilidad"),
    Rol(codigo="PEDIDOS", nombre="Gestor de Pedidos", descripcion="Ve y avanza estados de pedidos"),
    Rol(codigo="CLIENT",  nombre="Cliente", descripcion="Catálogo, carrito y pedidos propios"),
]

ESTADOS_PEDIDO = [
    EstadoPedido(codigo="PENDIENTE",  descripcion="Pendiente de confirmación", orden=1, es_terminal=False),
    EstadoPedido(codigo="CONFIRMADO", descripcion="Confirmado por el local",   orden=2, es_terminal=False),
    EstadoPedido(codigo="EN_PREP",    descripcion="En preparación",            orden=3, es_terminal=False),
    EstadoPedido(codigo="EN_CAMINO",  descripcion="En camino al cliente",      orden=4, es_terminal=False),
    EstadoPedido(codigo="ENTREGADO",  descripcion="Entregado al cliente",      orden=5, es_terminal=True),
    EstadoPedido(codigo="CANCELADO",  descripcion="Pedido cancelado",          orden=6, es_terminal=True),
]

FORMAS_PAGO = [
    FormaPago(codigo="EFECTIVO",       descripcion="Pago en efectivo",        habilitado=True),
    FormaPago(codigo="MERCADOPAGO",    descripcion="Mercado Pago Checkout",   habilitado=True),
    FormaPago(codigo="MERCADOPAGO_QR", descripcion="Mercado Pago QR",         habilitado=False),
]

USUARIOS = [
    {"username": "admin",   "nombre": "Admin",   "apellido": "Sistema", "email": "admin@store.com",   "rol": "ADMIN"},
    {"username": "stock",   "nombre": "Stock",   "apellido": "Sistema", "email": "stock@store.com",   "rol": "STOCK"},
    {"username": "pedidos", "nombre": "Pedidos", "apellido": "Sistema", "email": "pedidos@store.com", "rol": "PEDIDOS"},
    {"username": "cliente", "nombre": "Cliente", "apellido": "Demo",    "email": "cliente@store.com", "rol": "CLIENT"},
]

UNIDAD_MEDIDA = [
    UnidadMedida(nombre="Kilo", simbolo="kg", tipo="Masa"),
    UnidadMedida(nombre="Litro", simbolo="l", tipo="Volumen"),
    UnidadMedida(nombre="Unidad", simbolo="u", tipo="Unidad"),
    UnidadMedida(nombre="MetroCuadrado", simbolo="m2", tipo="Area"),
    UnidadMedida(nombre="Gramo", simbolo="g", tipo="Masa"),
    UnidadMedida(nombre="Mililitro", simbolo="ml", tipo="Volumen"),
    UnidadMedida(nombre="Docena", simbolo="doc", tipo="Unidad"),
]


def seed():
    with Session(engine) as session:
        for rol in ROLES:
            if not session.get(Rol, rol.codigo):
                session.add(rol)
        session.commit()

        for estado in ESTADOS_PEDIDO:
            if not session.get(EstadoPedido, estado.codigo):
                session.add(estado)
        session.commit()

        for fp in FORMAS_PAGO:
            if not session.get(FormaPago, fp.codigo):
                session.add(fp)
        session.commit()

        for u in USUARIOS:
            existing = session.exec(select(Usuario).where(Usuario.username == u["username"])).first()
            if not existing:
                usuario = Usuario(
                    username=u["username"],
                    nombre=u["nombre"],
                    apellido=u["apellido"],
                    email=u["email"],
                    password_hash=hash_password("1234"),
                )
                session.add(usuario)
                session.flush()
                session.add(UsuarioRol(usuario_id=usuario.id, rol_codigo=u["rol"]))
        session.commit()

        for medida in UNIDAD_MEDIDA:
            existing=session.exec(select(UnidadMedida).where(UnidadMedida.nombre == medida.nombre)).first()
            if not existing:
                session.add(medida)
        session.commit()
