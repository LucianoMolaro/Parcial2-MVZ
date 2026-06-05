from fastapi import HTTPException, status
from app.core.Security import create_access_token, get_acces_token_minutes, verify_password
from app.core.UnitOfWork import UnitOfWork
from app.modules.Usuario.model import Usuario
from app.modules.Usuario import service as usuarioService

def autenticar(username: str, password: str, uow: UnitOfWork) -> tuple[str, Usuario]:
    usuario = uow.usuarios.get_by_username(username)
    if not usuario or not verify_password(password, usuario.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not usuario.habilitado:
        raise HTTPException(status_code=400, detail="Cuenta desactivada")

    from datetime import timedelta
    token = create_access_token(
        {"sub": usuario.username},
        expires_delta=timedelta(minutes=get_acces_token_minutes),
    )
    return token, usuario