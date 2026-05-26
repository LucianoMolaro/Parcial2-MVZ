from typing import Annotated, List, Optional

from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app.core.Database import get_session
from app.core.deps import get_current_active_user, require_role
from app.modules.Ingrediente.schema import IngredienteCreate, IngredienteRead
from app.modules.Ingrediente import service as ingrediente_service

router = APIRouter(prefix="/ingredientes", tags=["Ingredientes"])


@router.get("/", response_model=List[IngredienteRead])
def listar_ingredientes(
    session: Session = Depends(get_session),
    nombre: Annotated[Optional[str], Query(min_length=1)] = None,
    offset: int = 0,
    limit: Annotated[int, Query(le=100)] = 10,
    _=Depends(get_current_active_user),
):
    return ingrediente_service.get_all(session, nombre, offset, limit)


@router.get("/{ingrediente_id}", response_model=IngredienteRead)
def obtener_ingrediente(
    ingrediente_id: int,
    session: Session = Depends(get_session),
    _=Depends(get_current_active_user),
):
    return ingrediente_service.get_by_id(session, ingrediente_id)


@router.post("/", response_model=IngredienteRead, status_code=201)
def crear_ingrediente(
    datos: IngredienteCreate,
    session: Session = Depends(get_session),
    _=Depends(require_role(["ADMIN"])),
):
    return ingrediente_service.create(session, datos)


@router.put("/{ingrediente_id}", response_model=IngredienteRead)
def editar_ingrediente(
    ingrediente_id: int,
    datos: IngredienteCreate,
    session: Session = Depends(get_session),
    _=Depends(require_role(["ADMIN"])),
):
    return ingrediente_service.update(session, ingrediente_id, datos)


@router.delete("/{ingrediente_id}", status_code=204)
def eliminar_ingrediente(
    ingrediente_id: int,
    session: Session = Depends(get_session),
    _=Depends(require_role(["ADMIN"])),
):
    ingrediente_service.delete(session, ingrediente_id)
