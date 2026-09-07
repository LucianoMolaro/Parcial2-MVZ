from sqlmodel import SQLModel

class CloudinaryRead(SQLModel):
    url: str
    public_id: str

class UploadRead(SQLModel):
    url: str
    public_id: str
