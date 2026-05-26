from typing import Annotated, List

from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app.core.Database import get_session
from app.core.deps import get_current_active_user, require_role
from app.modules.Usuario.model import Usuario
from app.modules.Usuario.schema import UsuarioCreate, UsuarioRead, UsuarioUpdate
from app.modules.Usuario import service as usuario_service

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])


@router.get("/me", response_model=UsuarioRead)
def obtener_mi_perfil(current_user: Usuario = Depends(get_current_active_user)):
    return current_user


@router.get("/", response_model=List[UsuarioRead])
def listar_usuarios(
    session: Session = Depends(get_session),
    offset: int = 0,
    limit: Annotated[int, Query(le=100)] = 10,
    _=Depends(require_role(["ADMIN"])),
):
    return usuario_service.get_all(session, offset, limit)


@router.get("/{usuario_id}", response_model=UsuarioRead)
def obtener_usuario(
    usuario_id: int,
    session: Session = Depends(get_session),
    _=Depends(require_role(["ADMIN"])),
):
    return usuario_service.get_by_id(session, usuario_id)


@router.post("/", response_model=UsuarioRead, status_code=201)
def crear_usuario(
    datos: UsuarioCreate,
    session: Session = Depends(get_session),
    _=Depends(require_role(["ADMIN"])),
):
    return usuario_service.create(session, datos)


@router.put("/{usuario_id}", response_model=UsuarioRead)
def editar_usuario(
    usuario_id: int,
    datos: UsuarioUpdate,
    session: Session = Depends(get_session),
    _=Depends(require_role(["ADMIN"])),
):
    return usuario_service.update(session, usuario_id, datos)


@router.delete("/{usuario_id}", status_code=204)
def eliminar_usuario(
    usuario_id: int,
    session: Session = Depends(get_session),
    _=Depends(require_role(["ADMIN"])),
):
    usuario_service.delete(session, usuario_id)
