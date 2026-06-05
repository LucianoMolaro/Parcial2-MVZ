from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session

from app.core.Database import get_session
from app.core.UnitOfWork import UnitOfWork
from app.core.deps import get_current_active_user, get_uow, require_role
from app.modules.Usuario.model import Usuario
from app.modules.Usuario.schema import UsuarioCreate, UsuarioRead, UsuarioUpdate
from app.modules.Usuario import service as usuarioService

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])



@router.get("/me", response_model=UsuarioRead)
def obtener_mi_perfil(current_user: Usuario = Depends(get_current_active_user)):
    return current_user


@router.get("/listaUsuario", response_model=list[UsuarioRead])
def listar_usuarios(
    page: int,
    current_user: Usuario = Depends(get_current_active_user), 
    uow: UnitOfWork = Depends(get_uow),
    _=Depends(require_role(["ADMIN"]))                
    ):
    if not uow.usuarios.get_codigos_roles(current_user.id):
        raise HTTPException(detail=f"Permisos insuficientes.")
    
    return uow.usuarios.get_all((page-1)*7)


@router.get("/listaUsuario/id/{usuario_id}", response_model=UsuarioRead)
def obtener_usuario(
    usuario_id: int,
    uow: UnitOfWork = Depends(get_uow),
    _=Depends(require_role(["ADMIN"])),
):
    return uow.usuarios.get_by_id(usuario_id)


@router.post("/crear", response_model=UsuarioRead, status_code=201)
def crear_usuario(
    datos: Usuario,
    uow: UnitOfWork = Depends(get_uow),
    _=Depends(require_role(["ADMIN"])),
):
    return uow.usuarios.add(datos)


@router.put("/{usuario_id}/actualizar", response_model=UsuarioRead)
def editar_usuario(
    usuario_id: int,
    datos: Usuario,
    uow: UnitOfWork = Depends(get_uow),
    _=Depends(require_role(["ADMIN"])),
    ):
    with uow:
        user = uow.usuarios.get_by_id(usuario_id)

        if not user:
            raise HTTPException(404, "Usuario no encontrado")
        uow.usuarios.update(user, datos)

    return user


@router.patch("/{usuario_id}/desactivar", status_code=204)
def eliminar_usuario(
    usuario_id: int,
    uow: UnitOfWork = Depends(get_uow),
    _=Depends(require_role(["ADMIN"])),
):
    user = uow.usuarios.get_by_id(usuario_id)
    uow.usuarios.softDelete(user)
