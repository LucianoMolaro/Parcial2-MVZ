from sqlmodel import SQLModel


class AsignarRolRequest(SQLModel):
    rol_codigo: str


class UsuarioRolRead(SQLModel):
    usuario_id: int
    rol_codigo: str
