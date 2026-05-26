from sqlmodel import Field, Relationship, SQLModel

class EstadoPedido(SQLModel, table=True):
    codigo: str = Field(max_length=20, primary_key=True)
    descripcion: str = Field(max_length=80)
    orden: int
    es_terminal: bool

    pedidos: list["Pedido"] = Relationship(back_populates="estado_pedido")
    historial: list["HistorialDetallePedido"] = Relationship(back_populates="estado") 
