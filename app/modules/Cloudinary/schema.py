from sqlmodel import SQLModel

class UploadRead(SQLModel):
    ok: bool = True
    url: str
    public_id: str
