import hashlib
import hmac
import logging

from fastapi import APIRouter, Depends, Query, Request, HTTPException

from app.core.Config import settings
from app.core.deps import get_current_active_user, get_uow
from app.core.UnitOfWork import UnitOfWork
from app.modules.Pago import service as pago_service
from app.modules.Pago.schema import PreferenciaResponse, PagoRead
from app.modules.Usuario.model import Usuario

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/pagos", tags=["Pagos"])


def _verify_mp_signature(x_signature: str, x_request_id: str, data_id: str) -> bool:
    try:
        parts = dict(p.split("=", 1) for p in x_signature.split(","))
        ts = parts.get("ts", "")
        v1 = parts.get("v1", "")
        manifest = f"id:{data_id};request-id:{x_request_id};ts:{ts};"
        expected = hmac.new(
            settings.MP_WEBHOOK_SECRET.encode(), manifest.encode(), hashlib.sha256
        ).hexdigest()
        return hmac.compare_digest(expected, v1)
    except Exception:
        return False


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
    # IPN format: ?topic=payment&id=PAYMENT_ID (sin firma)
    if topic and id:
        pago_service.procesar_webhook(uow, topic, id)
        return {"status": "ok"}

    # JSON webhook format: verifica firma si MP_WEBHOOK_SECRET está configurado
    try:
        body = await request.json()
        event_type = body.get("type", "")
        event_id = str(body.get("data", {}).get("id", ""))

        if not event_type or not event_id:
            return {"status": "ok"}

        if settings.MP_WEBHOOK_SECRET:
            x_sig = request.headers.get("x-signature", "")
            x_req_id = request.headers.get("x-request-id", "")
            if not x_sig or not _verify_mp_signature(x_sig, x_req_id, event_id):
                logger.warning("Webhook MP rechazado: firma inválida")
                raise HTTPException(status_code=400, detail="Firma inválida")

        pago_service.procesar_webhook(uow, event_type.replace(".", "_").split("_")[0], event_id)
    except HTTPException:
        raise
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
