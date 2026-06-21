from typing import List
from fastapi import HTTPException

from app.core.UnitOfWork import UnitOfWork
from app.modules.DireccionEntrega.model import DireccionEntrega
from app.modules.DireccionEntrega.schema import DireccionCreate


def get_all(uow: UnitOfWork, usuario_id: int) -> List[DireccionEntrega]:
    return uow.direcciones.get_by_usuario(usuario_id)


def get_by_id(uow: UnitOfWork, direccion_id: int) -> DireccionEntrega:
    d = uow.direcciones.get_habilitada(direccion_id)
    if not d:
        raise HTTPException(status_code=404, detail="Dirección no encontrada")
    return d


def create(uow: UnitOfWork, usuario_id: int, data: DireccionCreate) -> DireccionEntrega:
    with uow:
        direccion = DireccionEntrega(usuario_id=usuario_id, **data.model_dump())
        return uow.direcciones.add(direccion)


def update(uow: UnitOfWork, direccion_id: int, usuario_id: int, data: DireccionCreate) -> DireccionEntrega:
    with uow:
        d = uow.direcciones.get_habilitada(direccion_id)
        if not d:
            raise HTTPException(status_code=404, detail="Dirección no encontrada")
        if d.usuario_id != usuario_id:
            raise HTTPException(status_code=403, detail="Sin permiso sobre esta dirección")
        for field, value in data.model_dump().items():
            setattr(d, field, value)
        return d


def set_principal(uow: UnitOfWork, direccion_id: int, usuario_id: int) -> DireccionEntrega:
    with uow:
        d = uow.direcciones.get_habilitada(direccion_id)
        if not d:
            raise HTTPException(status_code=404, detail="Dirección no encontrada")
        if d.usuario_id != usuario_id:
            raise HTTPException(status_code=403, detail="Sin permiso sobre esta dirección")
        for otra in uow.direcciones.get_principales_by_usuario(usuario_id):
            otra.es_principal = False
        d.es_principal = True
        return d


def delete(uow: UnitOfWork, direccion_id: int, usuario_id: int) -> None:
    with uow:
        d = uow.direcciones.get_habilitada(direccion_id)
        if not d:
            raise HTTPException(status_code=404, detail="Dirección no encontrada")
        if d.usuario_id != usuario_id:
            raise HTTPException(status_code=403, detail="Sin permiso sobre esta dirección")
        uow.direcciones.softDelete(d)
