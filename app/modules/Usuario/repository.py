from sqlmodel import Session, select

from app.core.Repository import Repository
from app.modules.Rol.model import Rol
from app.modules.Usuario.model import Usuario
from app.modules.Usuario.schema import UsuarioRead
from app.modules.UsuarioRol.model import UsuarioRol


class UsuarioRepository(Repository[Usuario]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Usuario)

    def get_by_username(self, username: str):
        return self._session.exec(select(Usuario).where(Usuario.username == username)).first()

    def get_codigos_roles(self, id_user: int)->list[str]:
        return self._session.exec(
            select(Rol.codigo)
            .join(UsuarioRol, UsuarioRol.rol_codigo == Rol.codigo)
            .where(UsuarioRol.usuario_id == id_user)).all()
    
    def update(self, usuario: Usuario, data: UsuarioRead):
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(usuario, key, value)

        return usuario