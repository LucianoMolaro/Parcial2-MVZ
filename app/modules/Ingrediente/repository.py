from typing import List, Optional
from sqlmodel import Session, select

from app.core.Repository import Repository
from app.modules.Ingrediente.model import Ingrediente


class IngredienteRepository(Repository[Ingrediente]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Ingrediente)

    def get_by_id_locked(self, ingrediente_id: int) -> Optional[Ingrediente]:
        stmt = select(Ingrediente).where(Ingrediente.id == ingrediente_id).with_for_update()
        return self._session.exec(stmt).first()

    def get_all_filtrado(
        self,
        nombre: Optional[str],
        es_alergeno: Optional[bool],
        offset: int,
        limit: int,
    ) -> List[Ingrediente]:
        query = select(Ingrediente)
        if nombre:
            query = query.where(Ingrediente.nombre.contains(nombre))
        if es_alergeno is not None:
            query = query.where(Ingrediente.es_alergeno == es_alergeno)
        return self._session.exec(query.offset(offset).limit(limit)).all()
