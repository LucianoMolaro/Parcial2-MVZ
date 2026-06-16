from typing import Annotated, List, Optional

from fastapi import APIRouter, Depends, Query

from app.core.deps import get_current_active_user, get_uow, require_role
from app.core.UnitOfWork import UnitOfWork
from app.modules.Ingrediente.schema import IngredienteCreate, IngredienteRead
from app.modules.Ingrediente import service as ingrediente_service
from app.modules.UnidadMedida.model import UnidadMedida

router = APIRouter(prefix="/ingredientes", tags=["Ingredientes"])


@router.get("/", response_model=List[IngredienteRead])
def listar_ingredientes(
    nombre: Annotated[Optional[str], Query(min_length=1)] = None,
    es_alergeno: Optional[bool] = None,
    offset: int = 0,
    limit: Annotated[int, Query(le=100)] = 7,
    uow: UnitOfWork = Depends(get_uow),
    _=Depends(get_current_active_user),
):
    return ingrediente_service.get_all(uow, nombre, es_alergeno, offset, limit)


@router.get("/{ingrediente_id}", response_model=IngredienteRead)
def obtener_ingrediente(
    ingrediente_id: int,
    uow: UnitOfWork = Depends(get_uow),
    _=Depends(get_current_active_user),
):
    return ingrediente_service.get_by_id(uow, ingrediente_id)


@router.post("/", response_model=IngredienteRead, status_code=201)
def crear_ingrediente(
    datos: IngredienteCreate,
    uow: UnitOfWork = Depends(get_uow),
    _=Depends(require_role(["ADMIN", "STOCK"])),
):
    return ingrediente_service.create(uow, datos)


@router.put("/{ingrediente_id}", response_model=IngredienteRead)
def editar_ingrediente(
    ingrediente_id: int,
    datos: IngredienteCreate,
    uow: UnitOfWork = Depends(get_uow),
    _=Depends(require_role(["ADMIN", "STOCK"])),
):
    return ingrediente_service.update(uow, ingrediente_id, datos)


@router.delete("/{ingrediente_id}", status_code=204)
def eliminar_ingrediente(
    ingrediente_id: int,
    uow: UnitOfWork = Depends(get_uow),
    _=Depends(require_role(["ADMIN"])),
):
    ingrediente_service.delete(uow, ingrediente_id)

