from typing import List

from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.core.Database import get_session
from app.core.deps import get_current_active_user, require_role
from app.modules.EstadoPedido.schema import EstadoPedidoCreate, EstadoPedidoRead
from app.modules.EstadoPedido import service as estado_service

router = APIRouter(prefix="/estados-pedido", tags=["EstadosPedido"])


@router.get("/", response_model=List[EstadoPedidoRead])
def listar_estados(
    session: Session = Depends(get_session),
    _=Depends(get_current_active_user),
):
    return estado_service.get_all(session)


@router.get("/{codigo}", response_model=EstadoPedidoRead)
def obtener_estado(
    codigo: str,
    session: Session = Depends(get_session),
    _=Depends(get_current_active_user),
):
    return estado_service.get_by_codigo(session, codigo)


@router.post("/", response_model=EstadoPedidoRead, status_code=201)
def crear_estado(
    datos: EstadoPedidoCreate,
    session: Session = Depends(get_session),
    _=Depends(require_role(["ADMIN"])),
):
    return estado_service.create(session, datos)


@router.put("/{codigo}", response_model=EstadoPedidoRead)
def editar_estado(
    codigo: str,
    datos: EstadoPedidoCreate,
    session: Session = Depends(get_session),
    _=Depends(require_role(["ADMIN"])),
):
    return estado_service.update(session, codigo, datos)


@router.delete("/{codigo}", status_code=204)
def eliminar_estado(
    codigo: str,
    session: Session = Depends(get_session),
    _=Depends(require_role(["ADMIN"])),
):
    estado_service.delete(session, codigo)
