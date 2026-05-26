from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import app.core.models

from app.core.Database import create_db_and_tables
from app.core.Seed import seed
from app.modules.Auth.router import router as auth_router
from app.modules.Categoria.router import router as categoria_router
from app.modules.Ingrediente.router import router as ingrediente_router
from app.modules.Producto.router import router as producto_router
from app.modules.Usuario.router import router as usuario_router
from app.modules.Rol.router import router as rol_router
from app.modules.UsuarioRol.router import router as usuariorol_router
from app.modules.DireccionEntrega.router import router as direccion_router
from app.modules.EstadoPedido.router import router as estado_pedido_router
from app.modules.FormaPago.router import router as forma_pago_router
from app.modules.Pedido.router import router as pedido_router
from app.modules.DetallePedido.router import router as detalle_router
from app.modules.HistorialDetallePedido.router import router as historial_router
from app.modules.Admin.router import router as admin_router


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

app.include_router(auth_router,         prefix="/api/v1")
app.include_router(categoria_router,    prefix="/api/v1")
app.include_router(ingrediente_router,  prefix="/api/v1")
app.include_router(producto_router,     prefix="/api/v1")
app.include_router(usuario_router,      prefix="/api/v1")
app.include_router(rol_router,          prefix="/api/v1")
app.include_router(usuariorol_router,   prefix="/api/v1")
app.include_router(direccion_router,    prefix="/api/v1")
app.include_router(estado_pedido_router,prefix="/api/v1")
app.include_router(forma_pago_router,   prefix="/api/v1")
app.include_router(pedido_router,       prefix="/api/v1")
app.include_router(detalle_router,      prefix="/api/v1")
app.include_router(historial_router,    prefix="/api/v1")
app.include_router(admin_router,        prefix="/api/v1")


@app.get("/")
def root():
    return {"mensaje": "API funcionando correctamente"}