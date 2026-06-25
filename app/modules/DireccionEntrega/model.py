from decimal import Decimal
from typing import TYPE_CHECKING, Optional
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.Pedido.model import Pedido
    from app.modules.Usuario.model import Usuario

class DireccionEntrega(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id")
    alias: str
    calle1: str
    altura: str
    calle2: Optional[str] = Field(default=None)
    ciudad: str = Field(max_length=100)
    provincia: Optional[str] = Field(default=None, max_length=100)
    codigo_postal: Optional[str] = Field(default=None, max_length=10)
    es_principal: bool = Field(default=False)
    habilitado: bool = Field(default=True)

    usuario: Optional["Usuario"] = Relationship(back_populates="direcciones")
    pedidos: list["Pedido"] = Relationship(back_populates="direccion_entrega")
