from sqlmodel import SQLModel


class IngredienteCreate(SQLModel):
    nombre: str
    unidad_medida_id: int
    es_alergeno: bool = False
    stock_cantidad: float = 0


class IngredienteRead(SQLModel):
    id: int
    nombre: str
    unidad_medida_id: int
    es_alergeno: bool
    stock_cantidad: float
