from typing import Optional

from sqlmodel import BigInteger, Column, Field, SQLModel

class Imagen(SQLModel, table=True):
    id: Optional[int] = Field(default=None,sa_column=Column(BigInteger, primary_key=True, autoincrement=True))
    url: str
    public_id: str
    producto_id: Optional[int] = Field(foreign_key="producto.id")
