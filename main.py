from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.core.WsManager import ws_manager

# import app.core.models
from app.modules.Pedido.model import Pedido
from app.modules.DireccionEntrega.model import DireccionEntrega
from app.modules.Categoria.model import Categoria
from app.modules.Producto.model import Producto
from app.modules.EstadoPedido.model import EstadoPedido
from app.modules.DetallePedido.model import DetallePedido
from app.modules.FormaPago.model import FormaPago
from app.modules.Usuario.model import Usuario
from app.modules.UsuarioRol.model import UsuarioRol
from app.modules.Rol.model import Rol
from app.modules.ProductoIngrediente.model import ProductoIngrediente
from app.modules.Ingrediente.model import Ingrediente
from app.modules.UnidadMedida.model import UnidadMedida
from app.modules.Pago.model import Pago
from app.modules.HistorialEstadoPedido.model import HistorialEstadoPedido

from app.core.Database import create_db_and_tables
from app.core.Seed import seed

from app.modules.Auth.router import router as auth_router
from app.modules.Categoria.router import router as categoria_router
from app.modules.Ingrediente.router import router as ingrediente_router
from app.modules.Producto.router import router as producto_router
from app.modules.Usuario.router import router as usuario_router
# from app.modules.Rol.router import router as rol_router
# from app.modules.UsuarioRol.router import router as usuariorol_router
from app.modules.DireccionEntrega.router import router as direccion_router
# from app.modules.EstadoPedido.router import router as estado_pedido_router
# from app.modules.FormaPago.router import router as forma_pago_router
from app.modules.Pedido.router import router as pedido_router
from app.modules.DetallePedido.router import router as detalle_router
from app.modules.UnidadMedida.router import router as unidad_medida_router
from app.modules.Pago.router import router as pago_router
# from app.modules.Admin.router import router as admin_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    seed()
    yield


app = FastAPI(
    title="Integrador 1 - Programación IV",
    description="Arquitectura Router → Service → UoW → Repository",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(categoria_router)
app.include_router(ingrediente_router)
app.include_router(producto_router)
app.include_router(usuario_router)
# app.include_router(rol_router)
# app.include_router(usuariorol_router)
app.include_router(direccion_router)
# app.include_router(estado_pedido_router)
# app.include_router(forma_pago_router)
app.include_router(pedido_router)
app.include_router(detalle_router)
app.include_router(unidad_medida_router)
app.include_router(pago_router)



@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    connection = await ws_manager.connect(websocket, client_id)
    try:
        while True:
            message = await connection.receive_text()
            event = await ws_manager.process_message(client_id, message)
            if event and event.event_type == "join_room":
                room = (event.data or {}).get("room")
                if room:
                    await ws_manager.join_room(client_id, room)
    except WebSocketDisconnect:
        await ws_manager.disconnect(client_id)


@app.get("/")
def root():
    return {"mensaje": "API funcionando correctamente"}