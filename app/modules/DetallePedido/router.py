from fastapi import APIRouter, Depends, HTTPException

from app.core.deps import get_current_active_user, get_uow
from app.core.UnitOfWork import UnitOfWork
from app.modules.DetallePedido.model import DetallePedido
from app.modules.Usuario.model import Usuario

router = APIRouter(prefix="/detalles-pedido", tags=["DetallePedido"])


@router.get("/{pedido_id}", response_model=list[DetallePedido])
def listar_detalles(
    pedido_id: int,
    uow: UnitOfWork = Depends(get_uow),
    current_user: Usuario = Depends(get_current_active_user),
):
    detalles = uow.detalles.get_by_pedido(pedido_id)
    if not detalles:
        raise HTTPException(status_code=404, detail="No se encontraron detalles para ese pedido")
    return detalles
