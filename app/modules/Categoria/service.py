from typing import List, Optional
from fastapi import HTTPException

from app.core.UnitOfWork import UnitOfWork
from app.modules.Categoria.model import Categoria
from app.modules.Categoria.schema import CategoriaCreate, CategoriaTree


def get_all(uow: UnitOfWork, nombre: Optional[str], parent_id: Optional[int],
            offset: int, limit: int) -> List[Categoria]:
    return uow.categoria.get_all_filtrado(nombre, parent_id, offset, limit)


def get_tree(uow: UnitOfWork) -> List[CategoriaTree]:
    all_cats = uow.categoria.get_all_habilitadas()
    by_id = {
        c.id: CategoriaTree(id=c.id, nombre=c.nombre, descripcion=c.descripcion, parent_id=c.parent_id, subcategorias=[])
        for c in all_cats
    }
    roots = []
    for c in all_cats:
        if c.parent_id is None:
            roots.append(by_id[c.id])
        elif c.parent_id in by_id:
            by_id[c.parent_id].subcategorias.append(by_id[c.id])
    return roots


def get_by_id(uow: UnitOfWork, categoria_id: int) -> Categoria:
    c = uow.categoria.get_habilitada(categoria_id)
    if not c:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    return c


def create(uow: UnitOfWork, data: CategoriaCreate) -> Categoria:
    with uow:
        if data.parent_id and not uow.categoria.get_by_id(data.parent_id):
            raise HTTPException(status_code=404, detail="Categoría padre no encontrada")
        nueva = Categoria(nombre=data.nombre, descripcion=data.descripcion, parent_id=data.parent_id)
        return uow.categoria.add(nueva)


def update(uow: UnitOfWork, categoria_id: int, data: CategoriaCreate) -> Categoria:
    with uow:
        c = uow.categoria.get_habilitada(categoria_id)
        if not c:
            raise HTTPException(status_code=404, detail="Categoría no encontrada")
        c.nombre = data.nombre
        c.descripcion = data.descripcion
        c.parent_id = data.parent_id
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
