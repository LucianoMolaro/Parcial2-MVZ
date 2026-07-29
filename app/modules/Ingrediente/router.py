from fastapi import APIRouter, Depends

from app.core.deps import get_current_active_user, get_uow, require_role
from app.core.UnitOfWork import UnitOfWork
from app.modules.Ingrediente.schema import IngredienteCreate, IngredienteSchema, IngredienteUpdate
from app.modules.Ingrediente import service as ingrediente_service


router = APIRouter(prefix="/ingredientes", tags=["Ingredientes"])


@router.get("/", response_model=list[IngredienteSchema])
def listar_ingredientes(
    uow: UnitOfWork = Depends(get_uow),
    _=Depends(get_current_active_user),
):
    return ingrediente_service.get_all(uow)


@router.get("/{ingrediente_id}", response_model=IngredienteSchema)
def obtener_ingrediente(
    ingrediente_id: int,
    uow: UnitOfWork = Depends(get_uow),
    _=Depends(get_current_active_user),
):
    return ingrediente_service.get_by_id(uow, ingrediente_id)


@router.post("/", response_model=IngredienteSchema, status_code=201)
def crear_ingrediente(
    data: IngredienteCreate,
    uow: UnitOfWork = Depends(get_uow),
    _=Depends(require_role(["ADMIN", "STOCK"])),
):
    return ingrediente_service.create(uow, data)


@router.put("/{ingrediente_id}", response_model=IngredienteSchema)
def editar_ingrediente(
    ingrediente_id: int,
    datos: IngredienteUpdate,
    uow: UnitOfWork = Depends(get_uow),
    _=Depends(require_role(["ADMIN", "STOCK"])),
):
    return ingrediente_service.update(uow, datos)


@router.delete("/{ingrediente_id}", status_code=204)
def eliminar_ingrediente(
    ingrediente_id: int,
    uow: UnitOfWork = Depends(get_uow),
    _=Depends(require_role(["ADMIN"])),
):
    ingrediente_service.delete(uow, ingrediente_id)