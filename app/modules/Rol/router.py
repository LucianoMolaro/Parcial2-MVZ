from typing import List

from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.core.Database import get_session
from app.core.deps import require_role
from app.modules.Rol.schema import RolCreate, RolRead
from app.modules.Rol import service as rol_service

router = APIRouter(prefix="/roles", tags=["Roles"])


@router.get("/", response_model=List[RolRead])
def listar_roles(
    session: Session = Depends(get_session),
    _=Depends(require_role(["ADMIN"])),
):
    return rol_service.get_all(session)


@router.get("/{codigo}", response_model=RolRead)
def obtener_rol(
    codigo: str,
    session: Session = Depends(get_session),
    _=Depends(require_role(["ADMIN"])),
):
    return rol_service.get_by_codigo(session, codigo)


@router.post("/", response_model=RolRead, status_code=201)
def crear_rol(
    datos: RolCreate,
    session: Session = Depends(get_session),
    _=Depends(require_role(["ADMIN"])),
):
    return rol_service.create(session, datos)


@router.put("/{codigo}", response_model=RolRead)
def editar_rol(
    codigo: str,
    datos: RolCreate,
    session: Session = Depends(get_session),
    _=Depends(require_role(["ADMIN"])),
):
    return rol_service.update(session, codigo, datos)


@router.delete("/{codigo}", status_code=204)
def eliminar_rol(
    codigo: str,
    session: Session = Depends(get_session),
    _=Depends(require_role(["ADMIN"])),
):
    rol_service.delete(session, codigo)
