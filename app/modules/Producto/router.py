from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app.core.Database import get_session
from app.core.deps import get_current_active_user, require_role
from app.modules.Producto.schema import ProductoCreate, ProductoDisponibilidadUpdate, ProductoRead
from app.modules.Producto import service as producto_service

router = APIRouter(prefix="/productos", tags=["Productos"])
SD = Annotated[Session, Depends(get_session)]

@router.get("/", response_model=List[ProductoRead])
def listar_productos(
    session: Session = Depends(get_session),
    nombre: Annotated[Optional[str], Query(min_length=1)] = None,
    categoria_id: Optional[int] = None,
    solo_disponibles: bool = False,
    offset: int = 0,
    limit: Annotated[int, Query(le=100)] = 10,
    _=Depends(get_current_active_user),
):
    return producto_service.get_all(session, nombre, categoria_id, solo_disponibles, offset, limit)


@router.get("/{producto_id}", response_model=ProductoRead)
def obtener_producto(
    producto_id: int,
    session: SD,
    _=Depends(get_current_active_user),
):
    return producto_service.get_by_id(SD, producto_id)


@router.post("/", response_model=ProductoRead, status_code=201)
def crear_producto(
    datos: ProductoCreate,
    session: SD,
    _=Depends(require_role(["ADMIN"])),
):
    return producto_service.create(session, datos)


@router.put("/{producto_id}", response_model=ProductoRead)
def editar_producto(
    producto_id: int,
    datos: ProductoCreate,
    session: SD,
    _=Depends(require_role(["ADMIN"])),
):
    return producto_service.update(session, producto_id, datos)


@router.patch("/{producto_id}/disponibilidad", response_model=ProductoRead)
def actualizar_disponibilidad(
    producto_id: int,
    datos: ProductoDisponibilidadUpdate,
    session: SD,
    _=Depends(require_role(["ADMIN", "STOCK"])),
):
    return producto_service.update_disponibilidad(session, producto_id, datos)


@router.delete("/{producto_id}", status_code=204)
def eliminar_producto(
    producto_id: int,
    session: SD,
    _=Depends(require_role(["ADMIN"])),
):
    producto_service.delete(session, producto_id)
