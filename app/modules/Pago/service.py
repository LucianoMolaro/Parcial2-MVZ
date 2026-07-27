from decimal import Decimal
from typing import Optional

from fastapi import HTTPException, Request


from app.core.Config import settings
from app.core.MercadoPago import obtener_pago
from app.core.UnitOfWork import UnitOfWork
from app.modules.HistorialEstadoPedido.model import HistorialEstadoPedido
from app.modules.Pago.model import Pago

def crear_pago(uow:UnitOfWork, request: Request):
    
    params = request.query_params

    notification_type = params.get("type") or params.get("topic")
    payment_id = params.get("data.id") or params.get("id")

    if notification_type != "payment":
        return {"ok": True}

    payment = obtener_pago(payment_id)
    pedido = uow.pedidos.get_by_id(int(payment["external_reference"]))


    pago = Pago(
        mp_payment_id=payment["id"],
        mp_status=payment["status"],
        external_reference=payment["external_reference"],
        payment_method_id=payment["payment_method_id"],
        mp_status_detail=payment["status_detail"],
        transaction_amount=payment["transaction_amount"],
        pedido_id=pedido.id
    )

    with uow:
        uow.pagos.add(pago)
        pedido.pago=pago

    # return uow.pagos.add(pago)
    return {"ok": True}

def procesar_webhook(uow: UnitOfWork, topic: str, mp_id: str) -> None:
    if topic != "payment":
        return

    try:
        payment_id = int(mp_id)
    except (ValueError, TypeError):
        return

    if uow.pagos.get_by_mp_payment_id(payment_id):
        return

    payment = obtener_pago(payment_id)
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
