from typing import List, Optional
from sqlmodel import Session, select

from app.core.Repository import Repository
from app.modules.UsuarioRol.model import UsuarioRol


class UsuarioRolRepository(Repository[UsuarioRol]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, UsuarioRol)

    def get_by_usuario_y_rol(self, usuario_id: int, rol_codigo: str) -> Optional[UsuarioRol]:
        return self._session.exec(
            select(UsuarioRol).where(
                UsuarioRol.usuario_id == usuario_id,
                UsuarioRol.rol_codigo == rol_codigo,
            )
        ).first()

    def get_codigos_by_usuario(self, usuario_id: int) -> List[str]:
        return self._session.exec(
            select(UsuarioRol.rol_codigo).where(UsuarioRol.usuario_id == usuario_id)
        ).all()
