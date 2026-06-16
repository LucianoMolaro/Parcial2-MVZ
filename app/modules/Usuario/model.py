from typing import TYPE_CHECKING, Optional
from sqlmodel import Field, Relationship, SQLModel


from app.modules.UsuarioRol.model import UsuarioRol
from app.modules.HistorialEstadoPedido.model import HistorialEstadoPedido
if TYPE_CHECKING:
    from app.modules.DireccionEntrega.model import DireccionEntrega

    from app.modules.Pedido.model import Pedido
    from app.modules.Rol.model import Rol



class Usuario(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    nombre: str = Field(max_length=80)
    apellido: str = Field(max_length=80)
    email: str = Field(unique=True, max_length=254)
    celular: Optional[str] = Field(default=None, max_length=20)
    username: str = Field(unique=True)
    password_hash: str = Field(max_length=60)
    habilitado: bool = Field(default=True)

    roles: list["Rol"] = Relationship(link_model=UsuarioRol, sa_relationship_kwargs={"lazy": "selectin"})
    direcciones: list["DireccionEntrega"] = Relationship(back_populates="usuario", sa_relationship_kwargs={"lazy": "selectin"})
    pedidos: list["Pedido"] = Relationship(back_populates="usuario")
    historial: list["HistorialEstadoPedido"] = Relationship(back_populates="usuario")