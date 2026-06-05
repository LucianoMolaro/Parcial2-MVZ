from typing import Generic, TypeVar, Optional, List, Type
from sqlmodel import SQLModel, Session, select, update

from app.modules.Usuario.repository import UsuarioRepository

T = TypeVar("T", bound=SQLModel)


class Repository(Generic[T]):
   
    def __init__(self, session: Session, model: Type[T]) -> None:
        self._session = session
        self._model = model

    def get_all(self, offset: int = 0) -> List[T]:
        return self._session.exec(select(self._model).offset(offset).limit(7)).all()

    def get_by_id(self, id: int) -> Optional[T]:
        return self._session.get(self._model, id)

    def add(self, obj: T) -> T:
        self._session.add(obj)
        self._session.flush()
        return obj
    
    def softDelete(self, obj: T) -> None:
        obj.habilitado = False


    def delete(self, obj: T) -> None:
        self._session.delete(obj)
        self._session.flush()
