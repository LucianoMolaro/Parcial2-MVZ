from app.core.MercadoPago import crear_preferencia


def iniciar_pago(pedido) -> dict:
    preference_data = {
        "items": [
            {
                "title": f"Pedido #{pedido.id}",
                "quantity": 1,
                "unit_price": float(pedido.total)
            }
        ],
        "external_reference": str(pedido.id),
    }

    return crear_preferencia(preference_data)