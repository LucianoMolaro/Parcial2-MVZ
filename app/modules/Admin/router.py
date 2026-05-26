from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app.core.Database import get_session
from app.core.deps import require_role
from app.modules.Usuario.model import Usuario
from app.modules.Usuario.schema import UsuarioRead, UsuarioUpdate
from app.modules.Usuario import service as usuario_service
from app.modules.UsuarioRol.schema import AsignarRolRequest, UsuarioRolRead
from app.modules.UsuarioRol import service as usuariorol_service

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/usuarios", response_model=List[UsuarioRead])
def listar_usuarios(
    session: Session = Depends(get_session),
    rol: Annotated[Optional[str], Query(description="Filtrar por código de rol")] = None,
    offset: int = 0,
    limit: Annotated[int, Query(le=100)] = 10,
    _=Depends(require_role(["ADMIN"])),
):
    return usuario_service.get_all(session, rol, offset, limit)


@router.get("/usuarios/{usuario_id}", response_model=UsuarioRead)
def obtener_usuario(
    usuario_id: int,
    session: Session = Depends(get_session),
    _=Depends(require_role(["ADMIN"])),
):
    return usuario_service.get_by_id(session, usuario_id)


@router.put("/usuarios/{usuario_id}", response_model=UsuarioRead)
def editar_usuario(
    usuario_id: int,
    datos: UsuarioUpdate,
    session: Session = Depends(get_session),
    _=Depends(require_role(["ADMIN"])),
):
    return usuario_service.update(session, usuario_id, datos)


@router.delete("/usuarios/{usuario_id}", status_code=204)
def eliminar_usuario(
    usuario_id: int,
    session: Session = Depends(get_session),
    _=Depends(require_role(["ADMIN"])),
):
    usuario_service.delete(session, usuario_id)


@router.get("/usuarios/{usuario_id}/roles", response_model=List[UsuarioRolRead])
def listar_roles_usuario(
    usuario_id: int,
    session: Session = Depends(get_session),
    _=Depends(require_role(["ADMIN"])),
):
    return usuariorol_service.get_roles_de_usuario(session, usuario_id)


@router.post("/usuarios/{usuario_id}/roles", response_model=UsuarioRolRead, status_code=201)
def asignar_rol(
    usuario_id: int,
    datos: AsignarRolRequest,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(require_role(["ADMIN"])),
):
    return usuariorol_service.asignar_rol(session, usuario_id, datos, current_user.id)


@router.delete("/usuarios/{usuario_id}/roles/{rol_codigo}", status_code=204)
def revocar_rol(
    usuario_id: int,
    rol_codigo: str,
    session: Session = Depends(get_session),
    _=Depends(require_role(["ADMIN"])),
):
    usuariorol_service.revocar_rol(session, usuario_id, rol_codigo)
