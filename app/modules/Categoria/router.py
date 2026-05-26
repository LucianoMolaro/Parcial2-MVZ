from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app.core.Database import get_session
from app.core.deps import get_current_active_user, require_role
from app.modules.Categoria.schema import CategoriaCreate, CategoriaRead
from app.modules.Categoria import service as categoria_service

router = APIRouter(prefix="/categorias", tags=["Categorias"])


@router.get("/", response_model=List[CategoriaRead])
def listar_categorias(
    session: Session = Depends(get_session),
    nombre: Annotated[Optional[str], Query(min_length=1)] = None,
    parent_id: Optional[int] = None,
    offset: int = 0,
    limit: Annotated[int, Query(le=100)] = 10,
    _=Depends(get_current_active_user),
):
    return categoria_service.get_all(session, nombre, parent_id, offset, limit)


@router.get("/{categoria_id}", response_model=CategoriaRead)
def obtener_categoria(
    categoria_id: int,
    session: Session = Depends(get_session),
    _=Depends(get_current_active_user),
):
    return categoria_service.get_by_id(session, categoria_id)


@router.post("/", response_model=CategoriaRead, status_code=201)
def crear_categoria(
    datos: CategoriaCreate,
    session: Session = Depends(get_session),
    _=Depends(require_role(["ADMIN"])),
):
    return categoria_service.create(session, datos)


@router.put("/{categoria_id}", response_model=CategoriaRead)
def editar_categoria(
    categoria_id: int,
    datos: CategoriaCreate,
    session: Session = Depends(get_session),
    _=Depends(require_role(["ADMIN"])),
):
    return categoria_service.update(session, categoria_id, datos)


@router.delete("/{categoria_id}", status_code=204)
def eliminar_categoria(
    categoria_id: int,
    session: Session = Depends(get_session),
    _=Depends(require_role(["ADMIN"])),
):
    categoria_service.delete(session, categoria_id)
