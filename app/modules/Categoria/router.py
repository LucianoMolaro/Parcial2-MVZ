from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, Query

from app.core.deps import get_current_active_user, get_uow, require_role
from app.core.UnitOfWork import UnitOfWork
from app.modules.Categoria.schema import CategoriaCreate, CategoriaRead, CategoriaTree
from app.modules.Categoria import service as categoria_service

router = APIRouter(prefix="/categorias", tags=["Categorias"])


@router.get("/arbol", response_model=List[CategoriaTree])
def arbol_categorias(
    uow: UnitOfWork = Depends(get_uow),
    _=Depends(get_current_active_user),
):
    return categoria_service.get_tree(uow)


@router.get("/", response_model=List[CategoriaRead])
def listar_categorias(
    nombre: Annotated[Optional[str], Query(min_length=1)] = None,
    parent_id: Optional[int] = None,
    offset: int = 0,
    limit: Annotated[int, Query(le=100)] = 7,
    uow: UnitOfWork = Depends(get_uow),
    _=Depends(get_current_active_user),
):
    return categoria_service.get_all(uow, nombre, parent_id, offset, limit)


@router.get("/{categoria_id}", response_model=CategoriaRead)
def obtener_categoria(
    categoria_id: int,
    uow: UnitOfWork = Depends(get_uow),
    _=Depends(get_current_active_user),
):
    return categoria_service.get_by_id(uow, categoria_id)


@router.post("/", response_model=CategoriaRead, status_code=201)
def crear_categoria(
    datos: CategoriaCreate,
    uow: UnitOfWork = Depends(get_uow),
    _=Depends(require_role(["ADMIN"])),
):
    return categoria_service.create(uow, datos)


@router.put("/{categoria_id}", response_model=CategoriaRead)
def editar_categoria(
    categoria_id: int,
    datos: CategoriaCreate,
    uow: UnitOfWork = Depends(get_uow),
    _=Depends(require_role(["ADMIN"])),
):
    return categoria_service.update(uow, categoria_id, datos)


@router.patch("/{categoria_id}/reactivar", response_model=CategoriaRead)
def reactivar_categoria(
    categoria_id: int,
    uow: UnitOfWork = Depends(get_uow),
    _=Depends(require_role(["ADMIN"])),
):
    return categoria_service.reactivar(uow, categoria_id)


@router.delete("/{categoria_id}", status_code=204)
def eliminar_categoria(
    categoria_id: int,
    uow: UnitOfWork = Depends(get_uow),
    _=Depends(require_role(["ADMIN"])),
):
    categoria_service.delete(uow, categoria_id)
