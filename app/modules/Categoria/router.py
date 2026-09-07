from typing import Optional

from fastapi import APIRouter, Depends, Query

from app.core.deps import get_current_active_user, get_current_user, get_uow, require_role
from app.core.UnitOfWork import UnitOfWork
from app.modules.Categoria.schema import CategoriaCreate, CategoriaRead
from app.modules.Categoria import service as categoria_service

router = APIRouter(prefix="/categorias", tags=["Categorias"])


@router.get("/admin", response_model=list[CategoriaRead])
def listar_principales(
    uow: UnitOfWork = Depends(get_uow),
    _ = require_role(["ADMIN"])
):
    return categoria_service.get_principales_admin(uow)

@router.get("/catalogo", response_model=list[CategoriaRead])
def listar_principales(
    uow: UnitOfWork = Depends(get_uow)
):
    return categoria_service.get_principales_catalogo(uow)

@router.get("/subcategorias/{pid}", response_model=list[CategoriaRead])
def listar_subcategorias(
    pid: int,
    uow: UnitOfWork = Depends(get_uow),
    current_user = Depends(get_current_user)
):
    return categoria_service.get_por_padre(uow, current_user, pid)


@router.get("/{categoria_id}", response_model=CategoriaCreate)
def obtener_categoria(
    categoria_id: int,
    uow: UnitOfWork = Depends(get_uow),
    _=Depends(get_current_active_user),
):
    return categoria_service.get_by_id(uow, categoria_id)

@router.get("/arbol/{categoria_id}", response_model=list[CategoriaRead])
def cargar_arbol(
    categoria_id: int,
    uow: UnitOfWork = Depends(get_uow),
    _=Depends(require_role(["ADMIN"])),
):
    return categoria_service.get_arbol(uow, categoria_id)



@router.post("/crear", response_model=CategoriaRead, status_code=201)
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