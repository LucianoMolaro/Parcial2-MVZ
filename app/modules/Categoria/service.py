from typing import List, Optional
from fastapi import HTTPException

from app.core.UnitOfWork import UnitOfWork
from app.modules.Categoria.model import Categoria
from app.modules.Categoria.schema import CategoriaCreate, CategoriaSchema


def get_all(uow: UnitOfWork, parent_id: Optional[int] = None) -> List[Categoria]:
    return uow.categoria.get_by_parent(parent_id)


def get_by_id(uow: UnitOfWork, categoria_id: int) -> Categoria:
    c = uow.categoria.get_habilitada(categoria_id)
    if not c:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    return c


def create(uow: UnitOfWork, data: CategoriaCreate) -> Categoria:
    with uow:
        if data.parent_id and not uow.categoria.get_by_id(data.parent_id):
            raise HTTPException(status_code=404, detail="Categoría padre no encontrada")
        nueva = Categoria(
            nombre=data.nombre,
            descripcion=data.descripcion,
            parent_id=data.parent_id,
            imagen_url=data.imagen_url,
        )
        return uow.categoria.add(nueva)


def update(uow: UnitOfWork, categoria_id: int, data: CategoriaCreate) -> Categoria:
    with uow:
        c = uow.categoria.get_by_id(categoria_id)
        if not c:
            raise HTTPException(status_code=404, detail="Categoría no encontrada")
        c.nombre = data.nombre
        c.descripcion = data.descripcion
        c.parent_id = data.parent_id
        c.imagen_url = data.imagen_url
        c.habilitado = data.habilitado
        return c


def reactivar(uow: UnitOfWork, categoria_id: int) -> Categoria:
    with uow:
        c = uow.categoria.get_by_id(categoria_id)
        if not c:
            raise HTTPException(status_code=404, detail="Categoría no encontrada")
        c.habilitado = True
        return c


def delete(uow: UnitOfWork, categoria_id: int) -> None:
    with uow:
        c = uow.categoria.get_habilitada(categoria_id)
        if not c:
            raise HTTPException(status_code=404, detail="Categoría no encontrada")
        if uow.producto_categorias.get_by_categoria(categoria_id):
            raise HTTPException(
                status_code=409,
                detail="No se puede eliminar una categoría con productos activos",
            )
        uow.categoria.softDelete(c)