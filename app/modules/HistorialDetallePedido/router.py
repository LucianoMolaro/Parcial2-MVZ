from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.core.Database import get_session
from app.core.deps import get_current_active_user
from app.modules.HistorialDetallePedido.model import HistorialDetallePedido
from app.modules.HistorialDetallePedido.schema import HistorialRead
from app.modules.Pedido.model import Pedido
from app.modules.Usuario.model import Usuario
from app.modules.UsuarioRol.model import UsuarioRol

router = APIRouter(prefix="/pedidos/{pedido_id}/historial", tags=["Historial"])


@router.get("/", response_model=List[HistorialRead])
def listar_historial(
    pedido_id: int,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_active_user),
):
    pedido = session.get(Pedido, pedido_id)
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")

    roles = session.exec(
        select(UsuarioRol.rol_codigo).where(UsuarioRol.usuario_id == current_user.id)
    ).all()
    if pedido.usuario_id != current_user.id and not any(r in ["ADMIN", "PEDIDOS"] for r in roles):
        raise HTTPException(status_code=403, detail="Sin permiso para ver este historial")

    return session.exec(
        select(HistorialDetallePedido).where(HistorialDetallePedido.pedido_id == pedido_id)
    ).all()
