from sqlmodel import SQLModel

class imagenes(SQLModel, table=True):
    url: str
    public_id: str