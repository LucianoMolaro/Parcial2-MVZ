import uuid
from fastapi import HTTPException, status
from mercadopago import SDK
from mercadopago.config.request_options import RequestOptions
from app.core.Config import settings

sdk = SDK(settings.MP_ACCESS_TOKEN)

def crear_preferencia(preference_data: dict) -> dict:
    try:
        request_options = RequestOptions()
        request_options.idempotency_key = str(uuid.uuid4())

        result = sdk.preference().create(
            preference_data,
            request_options=request_options
        )

        body = result["response"]

        return {
            "preference_id": body["id"],
            "init_point": body["init_point"],
            "sandbox_init_point": body["sandbox_init_point"],
        }

    except Exception as e:
        print(type(e))
        print(e)
        raise


def obtener_pago(payment_id: int) -> dict:
    try:
        result = sdk.payment().get(payment_id)
        return result["response"]

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )