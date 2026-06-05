from sqlmodel import Session

from app.core.Repository import Repository
from app.modules.Ingrediente.model import Ingrediente



class IngredienteRepository(Repository[Ingrediente]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Ingrediente)