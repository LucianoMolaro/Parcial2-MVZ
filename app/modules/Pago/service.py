from decimal import Decimal
from typing import Optional

import mercadopago
from fastapi import HTTPException

from app.core.Config import settings
from app.core.UnitOfWork import UnitOfWork
from app.modules.HistorialEstadoPedido.model import HistorialEstadoPedido
from app.modules.Pago.model import Pago
from app.modules.Pago.schema import PreferenciaResponse


def _sdk() -> mercadopago.SDK:
    return mercadopago.SDK(settings.MP_ACCESS_TOKEN)


def crear_preferencia(
    uow: UnitOfWork, pedido_id: int, usuario_id: int
) -> PreferenciaResponse:
    pedido = uow.pedidos.get_by_id(pedido_id)
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    if pedido.usuario_id != usuario_id:
        raise HTTPException(status_code=403, detail="Sin permiso sobre este pedido")
    if pedido.estado_codigo != "PENDIENTE":
        raise HTTPException(
            status_code=409,
            detail=f"El pedido ya no está pendiente (estado: {pedido.estado_codigo})",
        )

    detalles = uow.detalles.get_by_pedido(pedido_id)
    items = [
        {
            "title": d.nombre,
            "quantity": int(d.cantidad),
            "unit_price": float(d.precio),
            "currency_id": "ARS",
        }
        for d in detalles
    ] or [
        {
            "title": f"Pedido #{pedido_id}",
            "quantity": 1,
            "unit_price": float(pedido.total),
            "currency_id": "ARS",
        }
    ]

    base = settings.MP_BACKEND_BASE_URL
    frontend = "http://localhost:5173"

    preference_data = {
        "items": items,
        "external_reference": str(pedido_id),
        "back_urls": {
            "success": f"{frontend}/pedidos?pago=exitoso&pedido_id={pedido_id}",
            "failure": f"{frontend}/pedidos?pago=fallido&pedido_id={pedido_id}",
            "pending": f"{frontend}/pedidos?pago=pendiente&pedido_id={pedido_id}",
        },
        "notification_url": f"{base}/pagos/webhook",
        "statement_descriptor": "Food Store",
    }

    result = _sdk().preference().create(preference_data)
    if result["status"] not in (200, 201):
        import logging
        logging.error(f"[MP] status={result['status']} response={result.get('response')}")
        raise HTTPException(
            status_code=502,
            detail=f"Error MP {result['status']}: {result.get('response')}",
        )

    checkout_url = result["response"]["sandbox_init_point"]
    return PreferenciaResponse(checkout_url=checkout_url, pedido_id=pedido_id)


def procesar_webhook(uow: UnitOfWork, topic: str, mp_id: str) -> None:
    if topic != "payment":
        return

    try:
        payment_id = int(mp_id)
    except (ValueError, TypeError):
        return

    if uow.pagos.get_by_mp_payment_id(payment_id):
        return

    result = _sdk().payment().get(payment_id)
    if result["status"] != 200:
        return

    payment = result["response"]
    status: str = payment.get("status", "")
    external_ref: Optional[str] = payment.get("external_reference")
    amount = Decimal(str(payment.get("transaction_amount", 0)))

    if not external_ref:
        return

    with uow:
        uow.pagos.add(Pago(
            mp_payment_id=payment_id,
            mp_status=status,
            mp_status_detail=payment.get("status_detail"),
            external_reference=external_ref,
            idemponcy_key=f"pago-{payment_id}",
            transaction_amount=amount,
            payment_method_id=payment.get("payment_method_id"),
            pedido_id=int(external_ref),
        ))

        if status == "approved":
            pedido = uow.pedidos.get_by_id(int(external_ref))
            if pedido and pedido.estado_codigo == "PENDIENTE":
                pedido.estado_codigo = "CONFIRMADO"
                uow.historial.add(HistorialEstadoPedido(
                    pedido_id=pedido.id,
                    estado_desde_id="PENDIENTE",
                    estado_hacia_id="CONFIRMADO",
                    usuario_id=pedido.usuario_id,
                ))
