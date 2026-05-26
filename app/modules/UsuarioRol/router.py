from typing import List

from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.core.Database import get_session
from app.core.deps import get_current_active_user, require_role
from app.modules.Usuario.model import Usuario
from app.modules.UsuarioRol.schema import AsignarRolRequest, UsuarioRolRead
from app.modules.UsuarioRol import service as usuariorol_service

router = APIRouter(prefix="/usuarios", tags=["UsuarioRol"])


@router.get("/{usuario_id}/roles", response_model=List[UsuarioRolRead])
def listar_roles_de_usuario(
    usuario_id: int,
    session: Session = Depends(get_session),
    _=Depends(require_role(["ADMIN"])),
):
    return usuariorol_service.get_roles_de_usuario(session, usuario_id)


@router.post("/{usuario_id}/roles", response_model=UsuarioRolRead, status_code=201)
def asignar_rol(
    usuario_id: int,
    datos: AsignarRolRequest,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(require_role(["ADMIN"])),
):
    return usuariorol_service.asignar_rol(session, usuario_id, datos, current_user.id)


@router.delete("/{usuario_id}/roles/{rol_codigo}", status_code=204)
def revocar_rol(
    usuario_id: int,
    rol_codigo: str,
    session: Session = Depends(get_session),
    _=Depends(require_role(["ADMIN"])),
):
    usuariorol_service.revocar_rol(session, usuario_id, rol_codigo)
