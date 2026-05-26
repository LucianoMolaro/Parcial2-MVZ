from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from sqlmodel import Session, select

from app.core.Database import get_session
from app.core.Security import create_access_token, hash_password, verify_password
from app.core.deps import get_current_active_user
from app.modules.Usuario.model import Usuario
from app.modules.UsuarioRol.model import UsuarioRol
from app.core.UnitOfWork import UnitOfWork

router = APIRouter(prefix="/auth", tags=["Auth"])

ACCESS_TOKEN_MINUTES = 30


def _autenticar(session: Session, username: str, password: str) -> tuple[str, list]:
    user = session.exec(select(Usuario).where(Usuario.username == username)).first()
    if not user or not verify_password(password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if user.deleted:
        raise HTTPException(status_code=400, detail="Cuenta desactivada")
    roles = session.exec(
        select(UsuarioRol.rol_codigo).where(UsuarioRol.usuario_id == user.id)
    ).all()
    from datetime import timedelta
    token = create_access_token(
        {"sub": user.username, "roles": list(roles)},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_MINUTES),
    )
    return token, list(roles)


@router.post("/token", summary="Login OAuth2 (Swagger UI)")
def token(form: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    
    jwt, roles = _autenticar(session, form.username, form.password)
    return {"access_token": jwt, "token_type": "bearer"}


class LoginRequest(BaseModel):
    username: str
    password: str


@router.post("/login", summary="Login JSON con cookie httpOnly")
def login(data: LoginRequest, response: Response, session: Session = Depends(get_session)):
    jwt, roles = _autenticar(session, data.username, data.password)
    response.set_cookie(
        key="access_token",
        value=jwt,
        httponly=True,
        max_age=ACCESS_TOKEN_MINUTES * 60,
        samesite="lax",
    )
    return {"username": data.username, "roles": roles}


class RegisterRequest(BaseModel):
    nombre: str
    apellido: str
    email: str
    celular: str | None = None
    username: str
    password: str


# @router.post("/register", status_code=201, summary="Registro público — asigna rol CLIENT")
# def register(data: RegisterRequest, session: Session = Depends(get_session)):

#     with UnitOfWork(session) as uow:

#         if uow._session.exec(select(Usuario).where(Usuario.email == data.email)).first():
#             raise HTTPException(status_code=409, detail="El email ya está registrado")

#         usuario = Usuario(
#             nombre=data.nombre,
#             apellido=data.apellido,
#             email=data.email,
#             celular=data.celular,
#             username=data.username,
#             password=hash_password(data.password),
#         )
#         uow._session.add(usuario)
#         uow._session.flush()
#         uow._session.add(UsuarioRol(usuario_id=usuario.id, rol_codigo="CLIENT"))
#         uow._session.flush()
#         return {"id": usuario.id, "email": usuario.email, "username": usuario.username}


@router.post("/logout", summary="Elimina cookie de sesión")
def logout(response: Response):
    response.delete_cookie("access_token")
    return {"detail": "Sesión cerrada"}


@router.get("/me", summary="Datos del usuario autenticado")
def me(current_user: Usuario = Depends(get_current_active_user)):
    return {
        "id": current_user.id,
        "nombre": current_user.nombre,
        "apellido": current_user.apellido,
        "email": current_user.email,
        "username": current_user.username,
    }
