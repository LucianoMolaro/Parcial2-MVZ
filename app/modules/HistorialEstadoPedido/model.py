from typing import TYPE_CHECKING, Optional

from sqlmodel import Field, Relationship, SQLModel
if TYPE_CHECKING:
    from app.modules.EstadoPedido.model import EstadoPedido
    from app.modules.Pedido.model import Pedido
    from app.modules.Usuario.model import Usuario


class HistorialEstadoPedido(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    pedido_id: int = Field(foreign_key="pedido.id", nullable=False)
    estado_desde_id: Optional[str] = Field(default=None, foreign_key="estadopedido.codigo")
    estado_hacia_id: str = Field(foreign_key="estadopedido.codigo", nullable=False)
    usuario_id: int = Field(foreign_key="usuario.id")

    
    pedido: "Pedido" = Relationship(back_populates="historial")
    estado_desde: Optional["EstadoPedido"] = Relationship(
        back_populates="historial_desde", 
        sa_relationship_kwargs={"foreign_keys": "[HistorialEstadoPedido.estado_desde_id]"}
    )
    estado_hacia: "EstadoPedido" = Relationship(
        back_populates="historial_hacia",
        sa_relationship_kwargs={"foreign_keys": "[HistorialEstadoPedido.estado_hacia_id]"}
    )
    usuario: "Usuario" = Relationship(back_populates="historial")


