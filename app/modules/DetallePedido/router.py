from fastapi import APIRouter, Depends, HTTPException

from app.core.deps import get_uow
from app.core.UnitOfWork import UnitOfWork

from app.modules.Pedido.schema import PedidoRead


router = APIRouter(prefix="/pedidos", tags=["DetallePedido"])

@router.get("/{pedido_id}", response_model=list[PedidoRead])
def listar_detalles(
    pedido_id: int,
    uow: UnitOfWork = Depends(get_uow),
):
    return 
