from typing import List

from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.core.Database import get_session
from app.core.deps import get_current_active_user, require_role
from app.modules.FormaPago.schema import FormaPagoCreate, FormaPagoRead
from app.modules.FormaPago import service as formapago_service

router = APIRouter(prefix="/formas-pago", tags=["FormasPago"])


@router.get("/", response_model=List[FormaPagoRead])
def listar_formas_pago(
    session: Session = Depends(get_session),
    _=Depends(get_current_active_user),
):
    return formapago_service.get_all(session)


@router.get("/{codigo}", response_model=FormaPagoRead)
def obtener_forma_pago(
    codigo: str,
    session: Session = Depends(get_session),
    _=Depends(get_current_active_user),
):
    return formapago_service.get_by_codigo(session, codigo)


@router.post("/", response_model=FormaPagoRead, status_code=201)
def crear_forma_pago(
    datos: FormaPagoCreate,
    session: Session = Depends(get_session),
    _=Depends(require_role(["ADMIN"])),
):
    return formapago_service.create(session, datos)


@router.put("/{codigo}", response_model=FormaPagoRead)
def editar_forma_pago(
    codigo: str,
    datos: FormaPagoCreate,
    session: Session = Depends(get_session),
    _=Depends(require_role(["ADMIN"])),
):
    return formapago_service.update(session, codigo, datos)


@router.delete("/{codigo}", status_code=204)
def deshabilitar_forma_pago(
    codigo: str,
    session: Session = Depends(get_session),
    _=Depends(require_role(["ADMIN"])),
):
    formapago_service.delete(session, codigo)
