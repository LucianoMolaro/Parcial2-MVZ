from fastapi import APIRouter, Depends, Query, Request

from app.core.deps import get_current_active_user, get_uow
from app.core.UnitOfWork import UnitOfWork
from app.modules.Pago import service as pago_service
from app.modules.Pago.schema import PreferenciaResponse, PagoRead
from app.modules.Usuario.model import Usuario

router = APIRouter(prefix="/pagos", tags=["Pagos"])


@router.post("/preferencia/{pedido_id}", response_model=PreferenciaResponse)
def crear_preferencia(
    pedido_id: int,
    uow: UnitOfWork = Depends(get_uow),
    current_user: Usuario = Depends(get_current_active_user),
):
    return pago_service.crear_preferencia(uow, pedido_id, current_user.id)


@router.post("/webhook")
async def webhook(
    request: Request,
    topic: str = Query(default=""),
    id: str = Query(default=""),
    uow: UnitOfWork = Depends(get_uow),
):
    # MP envía IPN como GET/POST con ?topic=payment&id=PAYMENT_ID
    # o como POST con body JSON { "type": "payment", "data": { "id": "123" } }
    if topic and id:
        pago_service.procesar_webhook(uow, topic, id)
        return {"status": "ok"}

    try:
        body = await request.json()
        event_type = body.get("type", "")
        event_id = str(body.get("data", {}).get("id", ""))
        if event_type and event_id:
            pago_service.procesar_webhook(uow, event_type.replace(".", "_").split("_")[0], event_id)
    except Exception:
        pass

    return {"status": "ok"}


@router.get("/pedido/{pedido_id}", response_model=PagoRead)
def get_pago_pedido(
    pedido_id: int,
    uow: UnitOfWork = Depends(get_uow),
    _: Usuario = Depends(get_current_active_user),
):
    from fastapi import HTTPException
    pago = uow.pagos.get_by_pedido(pedido_id)
    if not pago:
        raise HTTPException(status_code=404, detail="Pago no encontrado para este pedido")
    return pago
