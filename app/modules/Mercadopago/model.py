from sqlmodel import SQLModel


class PreferenciaRead(SQLModel):
    preference_id: str
    init_point: str