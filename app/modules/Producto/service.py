from typing import List, Optional

from fastapi import HTTPException
from sqlmodel import select

from app.core.UnitOfWork import UnitOfWork
from app.modules.Categoria.model import Categoria
from app.modules.Categoria.schema import CategoriaRead
from app.modules.Ingrediente.model import Ingrediente
from app.modules.Producto.model import Producto
from app.modules.Producto.schema import (
    ProductoCreate,
    ProductoDisponibilidadUpdate,
    ProductoIngredienteRead,
    ProductoRead,
)
from app.modules.ProductoCategoria.model import ProductoCategoria
from app.modules.ProductoIngrediente.model import ProductoIngrediente


def _cargar(uow: UnitOfWork, producto: Producto) -> ProductoRead:
    pc_links = uow._session.exec(
        select(ProductoCategoria).where(ProductoCategoria.producto_id == producto.id)
    ).all()
    categorias = []
    for link in pc_links:
        cat = uow._session.get(Categoria, link.categoria_id)
        if cat:
            categorias.append(CategoriaRead.model_validate(cat))

    pi_links = uow._session.exec(
        select(ProductoIngrediente).where(ProductoIngrediente.producto_id == producto.id)
    ).all()
    ingredientes = []
    for link in pi_links:
        ing = uow._session.get(Ingrediente, link.ingrediente_id)
        if ing:
            ingredientes.append(ProductoIngredienteRead(
                ingrediente_id=ing.id,
                nombre=ing.nombre,
                unidad_medida_id=ing.unidad_medida_id,
                es_alergeno=ing.es_alergeno,
                stock_cantidad=ing.stock_cantidad,
                cantidad=float(link.cantidad),
            ))

    return ProductoRead(
        id=producto.id,
        nombre=producto.nombre,
        precio=producto.precio,
        descripcion=producto.descripcion,
        disponible=producto.disponible,
        stock_cantidad=producto.stock_cantidad,
        categorias=categorias,
        ingredientes=ingredientes,
    )


def get_productos(uow: UnitOfWork, es_admin: bool, page: int) -> List[ProductoRead]:
    offset = (page - 1) * 5
    if not es_admin:
        query = select(Producto).where(Producto.habilitado == True, Producto.disponible == True).offset(offset).limit(5)
    else:
        query = select(Producto).offset(offset).limit(5)
    return [_cargar(uow, p) for p in uow._session.exec(query).all()]


def get_by_id(uow: UnitOfWork, producto_id: int) -> ProductoRead:
    producto = uow._session.get(Producto, producto_id)
    if not producto or not producto.habilitado:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return _cargar(uow, producto)


def create(uow: UnitOfWork, data: ProductoCreate) -> ProductoRead:
    with uow:
        producto = Producto(
            nombre=data.nombre, precio=data.precio, descripcion=data.descripcion,
            disponible=data.disponible, stock_cantidad=data.stock_cantidad,
        )
        uow._session.add(producto)
        uow._session.flush()

        for cat_id in data.categoria_ids:
            if not uow._session.get(Categoria, cat_id):
                raise HTTPException(status_code=404, detail=f"Categoría {cat_id} no encontrada")
            uow._session.add(ProductoCategoria(producto_id=producto.id, categoria_id=cat_id))

        for item in data.ingredientes:
            if not uow._session.get(Ingrediente, item.ingrediente_id):
                raise HTTPException(status_code=404, detail=f"Ingrediente {item.ingrediente_id} no encontrado")
            uow._session.add(ProductoIngrediente(
                producto_id=producto.id,
                ingrediente_id=item.ingrediente_id,
                cantidad=item.cantidad,
            ))
        uow._session.flush()
        return _cargar(uow, producto)


def update(uow: UnitOfWork, producto_id: int, data: ProductoCreate) -> ProductoRead:
    with uow:
        producto = uow._session.get(Producto, producto_id)
        if not producto or not producto.habilitado:
            raise HTTPException(status_code=404, detail="Producto no encontrado")

        producto.nombre = data.nombre
        producto.precio = data.precio
        producto.descripcion = data.descripcion
        producto.disponible = data.disponible
        producto.stock_cantidad = data.stock_cantidad

        for link in uow._session.exec(select(ProductoCategoria).where(ProductoCategoria.producto_id == producto_id)).all():
            uow._session.delete(link)
        for link in uow._session.exec(select(ProductoIngrediente).where(ProductoIngrediente.producto_id == producto_id)).all():
            uow._session.delete(link)
        uow._session.flush()

        for cat_id in data.categoria_ids:
            uow._session.add(ProductoCategoria(producto_id=producto.id, categoria_id=cat_id))
        for item in data.ingredientes:
            uow._session.add(ProductoIngrediente(
                producto_id=producto.id,
                ingrediente_id=item.ingrediente_id,
                cantidad=item.cantidad,
            ))
        uow._session.flush()
        return _cargar(uow, producto)


def update_disponibilidad(uow: UnitOfWork, producto_id: int, data: ProductoDisponibilidadUpdate) -> ProductoRead:
    with uow:
        producto = uow._session.get(Producto, producto_id)
        if not producto or not producto.habilitado:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        producto.stock_cantidad = data.stock_cantidad
        producto.disponible = data.disponible
        uow._session.flush()
        return _cargar(uow, producto)


def reactivar(uow: UnitOfWork, producto_id: int) -> ProductoRead:
    with uow:
        producto = uow._session.get(Producto, producto_id)
        if not producto:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        producto.habilitado = True
        uow._session.flush()
        return _cargar(uow, producto)


def delete(uow: UnitOfWork, producto_id: int) -> None:
    with uow:
        producto = uow._session.get(Producto, producto_id)
        if not producto or not producto.habilitado:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        producto.habilitado = False
        uow._session.flush()
