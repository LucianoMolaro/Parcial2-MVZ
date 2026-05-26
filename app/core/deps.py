from typing import Annotated, Optional

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session, select

from app.core.Database import get_session
from app.core.Security import decode_access_token
from app.modules.Usuario.model import Usuario
from app.modules.UsuarioRol.model import UsuarioRol

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token", auto_error=False)


async def get_current_user(
    request: Request,
    token_header: Optional[str] = Depends(oauth2_scheme),
    session: Session = Depends(get_session),
) -> Usuario:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciales inválidas o token expirado",
        headers={"WWW-Authenticate": "Bearer"},
    )

    token = request.cookies.get("access_token") or token_header
    if not token:
        raise credentials_exception

    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    
    username: str | None = payload.get("sub")
    if username is None:
        raise credentials_exception

    user = session.exec(select(Usuario).where(Usuario.username == username)).first()
    if user is None:
        raise credentials_exception
    return user


async def get_current_active_user(
    current_user: Annotated[Usuario, Depends(get_current_user)],
) -> Usuario:
    if current_user.deleted:
        raise HTTPException(
            status_code=400, 
            detail="Cuenta de usuario desactivada")
    return current_user


def require_role(allowed_roles: list[str]):
    async def role_checker(
        current_user: Annotated[Usuario, Depends(get_current_active_user)],
        session: Session = Depends(get_session),
    ) -> Usuario:
        roles = session.exec(
            select(UsuarioRol.rol_codigo).where(UsuarioRol.usuario_id == current_user.id)
        ).all()
        if not any(r in allowed_roles for r in roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permisos insuficientes. Se requiere uno de: {allowed_roles}",
            )
        return current_user
    return role_checker
