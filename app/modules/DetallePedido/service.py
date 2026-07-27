from decimal import Decimal

from fastapi import HTTPException, status

from app.core.UnitOfWork import UnitOfWork
from app.modules.DetallePedido.model import DetallePedido
from app.modules.DetallePedido.schema import DetalleCreate
from app.modules.Pedido.schema import PedidoRead

def crear_detalles(
    uow: UnitOfWork,
    detalles: list[DetalleCreate],
    pedido_id: int,
    producto_id: int,
    personalizacion: list[int],
    personalizacion_nombres: list[str],
    nombre: str,
    precio: Decimal,
    subtotal: Decimal,

) -> list[DetallePedido]:

    if not detalles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Debe enviar al menos un detalle."
        )
    
    
    detallesPedidos: list[DetallePedido] = []
    with uow:
        
        for d in detalles:
            
            if not pedido_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="El pedido es inválido."
                )

            if not producto_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="El producto es inválido."
                )

            if d.cantidad <= 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="La cantidad debe ser mayor a 0."
                )

            if not nombre or not nombre.strip():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="El nombre del producto es obligatorio."
                )

            if precio is None or precio < Decimal("0"):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="El precio es inválido."
                )

            detallesPedidos.append(
                (DetallePedido(
                    pedido_id=pedido_id, 
                    producto_id=producto_id, 
                    cantidad=d.cantidad,
                    nombre=nombre,
                    precio=precio,
                    subtotal=subtotal,
                    personalizacion=personalizacion,
                    personalizacion_nombres=personalizacion_nombres
                ))  
            )
        for d in detallesPedidos:
            uow.detalles.add(d)


    return detallesPedidos



def obtener_por_pedido(uow: UnitOfWork, pedido_id: int) -> list[PedidoRead]:
    pedido = uow.pedidos.get_by_id(pedido_id)
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    return pedido