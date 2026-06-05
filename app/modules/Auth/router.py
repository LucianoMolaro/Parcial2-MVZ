from typing import Annotated

from fastapi import APIRouter, Depends, Response
from fastapi.security import *

from app.core.Security import get_acces_token_minutes, get_acces_token_minutes
from app.core.UnitOfWork import UnitOfWork
from app.core.deps import *
from app.modules.Auth import service as authService
from app.modules.Usuario.model import Usuario
from app.modules.Usuario.schema import UsuarioLogin, UsuarioRead

router = APIRouter(prefix="/auth", tags=["Auth"])



@router.post("/login", response_model= UsuarioRead)
def login(data: UsuarioLogin, response: Response, uow: UnitOfWork = Depends(get_uow)):
    jwt, usuario = authService.autenticar(data.username, data.password, uow)
    response.set_cookie(
        key="access_token",
        value=jwt,
        httponly=True,
        max_age=get_acces_token_minutes() * 60,
        samesite="lax",
        secure=False
    )
    return usuario



@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    return {"detail": "Sesión cerrada"}


@router.post("/token", summary="Login OAuth2 (Swagger UI)")
def token(form: OAuth2PasswordRequestForm = Depends(), uow: UnitOfWork=Depends(get_uow)):

    jwt, user = authService.autenticar(form.username, form.password, uow)
    return {"access_token": jwt, "token_type": "bearer"}


@router.get("/me", response_model=UsuarioRead)
def me(current_user: Annotated[Usuario, Depends(get_current_active_user)]):
    return current_user
