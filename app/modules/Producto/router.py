from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, Query, UploadFile, File, HTTPException

from app.core.deps import get_current_active_user, get_current_user_optional, get_uow, require_role
from app.core.UnitOfWork import UnitOfWork
from app.core.Cloudinary import upload_image_to_cloud
from app.modules.Producto.schema import ProductoCarrito, ProductoCreate, ProductoDisponibilidadUpdate, ProductoRead
from app.modules.Producto import service as producto_service
from app.modules.Usuario.model import Usuario

router = APIRouter(prefix="/productos", tags=["Productos"])

ROLES_ADMIN = {"ADMIN", "STOCK"}

@router.get("/", response_model=List[ProductoRead])
def listar_productos(
    page: int = 1,
    uow: UnitOfWork = Depends(get_uow),
    current_user: Optional[Usuario] = Depends(get_current_user_optional),
):
    es_admin = False
    if current_user:
        roles = uow.usuarios.get_codigos_roles(current_user.id)
        es_admin = bool(ROLES_ADMIN.intersection(roles))
    return producto_service.get_productos(uow, es_admin, page)


@router.get("/{producto_id}", response_model=ProductoRead)
def obtener_producto(
    producto_id: int,
    uow: UnitOfWork = Depends(get_uow),
    _=Depends(get_current_active_user),
):
    return producto_service.get_by_id(uow, producto_id)


@router.post("/", response_model=ProductoRead, status_code=201)
def crear_producto(
    datos: ProductoCreate,
    uow: UnitOfWork = Depends(get_uow),
    _=Depends(require_role(["ADMIN", "STOCK"])),
):
    return producto_service.create(uow, datos)


@router.put("/{producto_id}", response_model=ProductoRead)
def editar_producto(
    producto_id: int,
    datos: ProductoCreate,
    uow: UnitOfWork = Depends(get_uow),
    _=Depends(require_role(["ADMIN", "STOCK"])),
):
    return producto_service.update(uow, producto_id, datos)


@router.patch("/{producto_id}/disponibilidad", response_model=ProductoRead)
def actualizar_disponibilidad(
    producto_id: int,
    datos: ProductoDisponibilidadUpdate,
    uow: UnitOfWork = Depends(get_uow),
    _=Depends(require_role(["ADMIN", "STOCK"])),
):
    return producto_service.update_disponibilidad(uow, producto_id, datos)


@router.patch("/{producto_id}/reactivar", response_model=ProductoRead)
def reactivar_producto(
    producto_id: int,
    uow: UnitOfWork = Depends(get_uow),
    _=Depends(require_role(["ADMIN", "STOCK"])),
):
    return producto_service.reactivar(uow, producto_id)


@router.post("/{producto_id}/imagen", response_model=ProductoRead)
async def subir_imagen_producto(
    producto_id: int,
    imagen: UploadFile = File(...),
    uow: UnitOfWork = Depends(get_uow),
    _=Depends(require_role(["ADMIN", "STOCK"])),
):
    if not imagen.content_type or not imagen.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="El archivo debe ser una imagen")
    contenido = await imagen.read()
    resultado = upload_image_to_cloud(contenido, "productos")
    return producto_service.update_imagen(uow, producto_id, resultado["url"])


@router.delete("/{producto_id}", status_code=204)
def eliminar_producto(
    producto_id: int,
    uow: UnitOfWork = Depends(get_uow),
    _=Depends(require_role(["ADMIN", "STOCK"])),
):
    producto_service.delete(uow, producto_id)
