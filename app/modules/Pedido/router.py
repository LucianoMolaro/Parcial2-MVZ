from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select

from app.core.Database import get_session
from app.core.deps import get_current_active_user, require_role
from app.modules.Usuario.model import Usuario
from app.modules.UsuarioRol.model import UsuarioRol
from app.modules.Pedido.schema import PedidoCambiarEstado, PedidoCreate, PedidoRead
from app.modules.Pedido import service as pedido_service

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])


def _get_roles(session: Session, usuario_id: int) -> list[str]:
    return session.exec(
        select(UsuarioRol.rol_codigo).where(UsuarioRol.usuario_id == usuario_id)
    ).all()


@router.get("/", response_model=List[PedidoRead])
def listar_pedidos(
    session: Session = Depends(get_session),
    offset: int = 0,
    limit: Annotated[int, Query(le=100)] = 10,
    current_user: Usuario = Depends(get_current_active_user),
):
    roles = _get_roles(session, current_user.id)
    filtro = None if any(r in ["ADMIN", "PEDIDOS"] for r in roles) else current_user.id
    return pedido_service.get_all(session, filtro, offset, limit)


@router.get("/{pedido_id}", response_model=PedidoRead)
def obtener_pedido(
    pedido_id: int,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_active_user),
):
    pedido = pedido_service.get_by_id(session, pedido_id)
    roles = _get_roles(session, current_user.id)
    if pedido.usuario_id != current_user.id and not any(r in ["ADMIN", "PEDIDOS"] for r in roles):
        raise HTTPException(status_code=403, detail="Sin permiso para ver este pedido")
    return pedido


@router.post("/", response_model=PedidoRead, status_code=201)
def crear_pedido(
    datos: PedidoCreate,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_active_user),
):
    return pedido_service.create(session, current_user.id, datos)


@router.patch("/{pedido_id}/estado", response_model=PedidoRead)
def cambiar_estado(
    pedido_id: int,
    datos: PedidoCambiarEstado,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_active_user),
):
    roles = _get_roles(session, current_user.id)
    es_cliente = not any(r in ["ADMIN", "PEDIDOS"] for r in roles)
    return pedido_service.cambiar_estado(session, pedido_id, datos, current_user.id, es_cliente)


@router.delete("/{pedido_id}", status_code=204)
def cancelar_pedido(
    pedido_id: int,
    session: Session = Depends(get_session),
    _=Depends(require_role(["ADMIN"])),
):
    from app.modules.Pedido.schema import PedidoCambiarEstado
    pedido_service.cambiar_estado(
        session, pedido_id,
        PedidoCambiarEstado(estado_pedido_codigo="CANCELADO", motivo="Cancelado por ADMIN"),
        actor_id=0, es_cliente=False,
    )
