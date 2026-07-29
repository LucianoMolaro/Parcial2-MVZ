from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.deps import get_current_active_user, get_uow, require_role
from app.core.UnitOfWork import UnitOfWork
from app.core.WsManager import ws_manager
from app.modules.Usuario.model import Usuario
from app.modules.Pedido.schema import PedidoCambiarEstado, PedidoCreate, PedidoRead
from app.modules.Pedido import service as pedido_service

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])


def _get_roles(uow: UnitOfWork, usuario_id: int) -> list[str]:
    return uow.usuario_roles.get_codigos_by_usuario(usuario_id)


@router.get("/", response_model=List[PedidoRead])
def listar_pedidos(
    uow: UnitOfWork = Depends(get_uow),
    _=Depends(require_role(["ADMIN", "PEDIDOS"])),
):
    return pedido_service.get_all(uow)


@router.get("/usuario", response_model=List[PedidoRead])
def listar_pedidos_usuario(
    uow: UnitOfWork = Depends(get_uow),
    current_user: Usuario = Depends(get_current_active_user),
):
    return uow.pedidos.get_pedidos_usuario(current_user)


@router.get("/{pedido_id}", response_model=PedidoRead)
def obtener_pedido(
    pedido_id: int,
    uow: UnitOfWork = Depends(get_uow),
    current_user: Usuario = Depends(get_current_active_user),
):
    pedido = pedido_service.get_by_id(uow, pedido_id)
    roles = _get_roles(uow, current_user.id)
    if pedido.usuario_id != current_user.id and not any(r in ["ADMIN", "PEDIDOS"] for r in roles):
        raise HTTPException(status_code=403, detail="Sin permiso para ver este pedido")
    return pedido


@router.post("/crear", response_model=PedidoRead, status_code=201)
async def crear_pedido(
    datos: PedidoCreate,
    uow: UnitOfWork = Depends(get_uow),
    current_user: Usuario = Depends(get_current_active_user),
):
    pedido, init_point = await pedido_service.crear_pedido(uow, datos, current_user.id)

    respuesta = PedidoRead.model_validate(pedido, from_attributes=True)
    respuesta.init_point = init_point
    return respuesta


@router.patch("/{pedido_id}/estado", response_model=PedidoRead)
async def cambiar_estado(
    pedido_id: int,
    datos: PedidoCambiarEstado,
    uow: UnitOfWork = Depends(get_uow),
    current_user: Usuario = Depends(get_current_active_user),
):
    roles = _get_roles(uow, current_user.id)
    es_cliente = not any(r in ["ADMIN", "PEDIDOS"] for r in roles)
    pedido = pedido_service.cambiar_estado(uow, pedido_id, datos, current_user.id, es_cliente)

    await ws_manager.broadcast(
        {
            "pedido_id": pedido.id,
            "usuario_id": pedido.usuario_id,
            "estado_codigo": pedido.estado_codigo,
        },
        "pedido_estado_actualizado",
    )

    return pedido


@router.delete("/{pedido_id}", status_code=204)
async def cancelar_pedido(
    pedido_id: int,
    uow: UnitOfWork = Depends(get_uow),
    current_user: Usuario = Depends(get_current_active_user),
    _=Depends(require_role(["ADMIN"])),
):
    pedido = pedido_service.cambiar_estado(
        uow, pedido_id,
        PedidoCambiarEstado(estado_pedido_codigo="CANCELADO", motivo="Cancelado por ADMIN"),
        actor_id=current_user.id, es_cliente=False,
    )
    await ws_manager.broadcast(
        {"pedido_id": pedido.id, "usuario_id": pedido.usuario_id, "estado_codigo": "CANCELADO"},
        "pedido_estado_actualizado",
    )