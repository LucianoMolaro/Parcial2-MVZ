from typing import List, Optional
from fastapi import HTTPException
from sqlmodel import select

from app.core.UnitOfWork import UnitOfWork
from app.modules.Categoria.model import Categoria
from app.modules.Categoria.schema import CategoriaCreate, CategoriaTree
from app.modules.ProductoCategoria.model import ProductoCategoria


def get_all(uow: UnitOfWork, nombre: Optional[str], parent_id: Optional[int],
            offset: int, limit: int) -> List[Categoria]:
    query = select(Categoria).where(Categoria.habilitado == True)
    if nombre:
        query = query.where(Categoria.nombre.contains(nombre))
    if parent_id is not None:
        query = query.where(Categoria.parent_id == parent_id)
    return uow._session.exec(query.offset(offset).limit(limit)).all()


def get_tree(uow: UnitOfWork) -> List[CategoriaTree]:
    all_cats = uow._session.exec(select(Categoria).where(Categoria.habilitado == True)).all()
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
    c = uow._session.get(Categoria, categoria_id)
    if not c or not c.habilitado:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    return c


def create(uow: UnitOfWork, data: CategoriaCreate) -> Categoria:
    with uow:
        if data.parent_id and not uow._session.get(Categoria, data.parent_id):
            raise HTTPException(status_code=404, detail="Categoría padre no encontrada")
        nueva = Categoria(nombre=data.nombre, descripcion=data.descripcion, parent_id=data.parent_id)
        uow._session.add(nueva)
        uow._session.flush()
        return nueva


def update(uow: UnitOfWork, categoria_id: int, data: CategoriaCreate) -> Categoria:
    with uow:
        c = uow._session.get(Categoria, categoria_id)
        if not c or not c.habilitado:
            raise HTTPException(status_code=404, detail="Categoría no encontrada")
        c.nombre = data.nombre
        c.descripcion = data.descripcion
        c.parent_id = data.parent_id
        uow._session.flush()
        return c


def reactivar(uow: UnitOfWork, categoria_id: int) -> Categoria:
    with uow:
        c = uow._session.get(Categoria, categoria_id)
        if not c:
            raise HTTPException(status_code=404, detail="Categoría no encontrada")
        c.habilitado = True
        uow._session.flush()
        return c


def delete(uow: UnitOfWork, categoria_id: int) -> None:
    with uow:
        c = uow._session.get(Categoria, categoria_id)
        if not c or not c.habilitado:
            raise HTTPException(status_code=404, detail="Categoría no encontrada")
        tiene_productos = uow._session.exec(
            select(ProductoCategoria).where(ProductoCategoria.categoria_id == categoria_id)
        ).first()
        if tiene_productos:
            raise HTTPException(
                status_code=409,
                detail="No se puede eliminar una categoría con productos activos",
            )
        c.habilitado = False
        uow._session.flush()
