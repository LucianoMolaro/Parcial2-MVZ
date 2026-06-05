from typing import List
from fastapi import APIRouter, Depends, HTTPException

from app.core.deps import get_current_active_user, get_uow
from app.core.UnitOfWork import UnitOfWork
from app.modules.Usuario.model import Usuario
from app.modules.DireccionEntrega.schema import DireccionCreate, DireccionRead
from app.modules.DireccionEntrega import service as direccion_service

router = APIRouter(prefix="/direcciones", tags=["Direcciones"])


@router.get("/", response_model=List[DireccionRead])
def listar_direcciones(
    uow: UnitOfWork = Depends(get_uow),
    current_user: Usuario = Depends(get_current_active_user),
):
    return direccion_service.get_all(uow, current_user.id)


@router.get("/{direccion_id}", response_model=DireccionRead)
def obtener_direccion(
    direccion_id: int,
    uow: UnitOfWork = Depends(get_uow),
    current_user: Usuario = Depends(get_current_active_user),
):
    d = direccion_service.get_by_id(uow, direccion_id)
    if d.usuario_id != current_user.id:
        raise HTTPException(status_code=403, detail="Sin permiso sobre esta dirección")
    return d


@router.post("/", response_model=DireccionRead, status_code=201)
def crear_direccion(
    datos: DireccionCreate,
    uow: UnitOfWork = Depends(get_uow),
    current_user: Usuario = Depends(get_current_active_user),
):
    return direccion_service.create(uow, current_user.id, datos)


@router.put("/{direccion_id}", response_model=DireccionRead)
def editar_direccion(
    direccion_id: int,
    datos: DireccionCreate,
    uow: UnitOfWork = Depends(get_uow),
    current_user: Usuario = Depends(get_current_active_user),
):
    return direccion_service.update(uow, direccion_id, current_user.id, datos)


@router.patch("/{direccion_id}/principal", response_model=DireccionRead)
def marcar_principal(
    direccion_id: int,
    uow: UnitOfWork = Depends(get_uow),
    current_user: Usuario = Depends(get_current_active_user),
):
    return direccion_service.set_principal(uow, direccion_id, current_user.id)


@router.delete("/{direccion_id}", status_code=204)
def eliminar_direccion(
    direccion_id: int,
    uow: UnitOfWork = Depends(get_uow),
    current_user: Usuario = Depends(get_current_active_user),
):
    direccion_service.delete(uow, direccion_id, current_user.id)
