from typing import List, Optional
from fastapi import HTTPException
from sqlmodel import select

from app.core.UnitOfWork import UnitOfWork
from app.modules.Producto.model import Producto
from app.modules.Producto.schema import ProductoCreate, ProductoDisponibilidadUpdate, ProductoIngredienteRead
from app.modules.Categoria.model import Categoria
from app.modules.Ingrediente.model import Ingrediente
from app.modules.ProductoCategoria.model import ProductoCategoria
from app.modules.ProductoIngrediente.model import ProductoIngrediente


def _cargar(uow: UnitOfWork, producto: Producto) -> dict:
    _ = producto.categorias
    _ = producto.ingrediente_links
    for link in producto.ingrediente_links:
        _ = link.ingrediente
    ingredientes = [
        ProductoIngredienteRead(
            ingrediente_id=link.ingrediente_id,
            nombre=link.ingrediente.nombre,
            unidad=link.ingrediente.unidad,
            es_alergeno=link.ingrediente.es_alergeno,
            stock_cantidad=link.ingrediente.stock_cantidad,
            cantidad=link.cantidad,
        )
        for link in producto.ingrediente_links
    ]
    return {
        "id": producto.id,
        "nombre": producto.nombre,
        "precio": producto.precio,
        "descripcion": producto.descripcion,
        "disponible": producto.disponible,
        "stock_cantidad": producto.stock_cantidad,
        "categorias": producto.categorias,
        "ingredientes": ingredientes,
    }


def get_all(uow: UnitOfWork, nombre: Optional[str], categoria_id: Optional[int],
            solo_disponibles: bool, offset: int, limit: int) -> List[dict]:
    query = select(Producto).where(Producto.deleted == False)
    if nombre:
        query = query.where(Producto.nombre.contains(nombre))
    if categoria_id:
        query = query.join(ProductoCategoria).where(ProductoCategoria.categoria_id == categoria_id)
    if solo_disponibles:
        query = query.where(Producto.disponible == True)
    return [_cargar(uow, p) for p in uow._session.exec(query.offset(offset).limit(limit)).all()]


def get_by_id(uow: UnitOfWork, producto_id: int) -> dict:
    producto = uow._session.get(Producto, producto_id)
    if not producto or producto.deleted:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return _cargar(uow, producto)


def create(uow: UnitOfWork, data: ProductoCreate) -> dict:
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


def update(uow: UnitOfWork, producto_id: int, data: ProductoCreate) -> dict:
    with uow:
        producto = uow._session.get(Producto, producto_id)
        if not producto or producto.deleted:
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


def update_disponibilidad(uow: UnitOfWork, producto_id: int, data: ProductoDisponibilidadUpdate) -> dict:
    with uow:
        producto = uow._session.get(Producto, producto_id)
        if not producto or producto.deleted:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        producto.stock_cantidad = data.stock_cantidad
        producto.disponible = data.disponible
        uow._session.flush()
        return _cargar(uow, producto)


def reactivar(uow: UnitOfWork, producto_id: int) -> dict:
    with uow:
        producto = uow._session.get(Producto, producto_id)
        if not producto:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        producto.deleted = False
        uow._session.flush()
        return _cargar(uow, producto)


def delete(uow: UnitOfWork, producto_id: int) -> None:
    with uow:
        producto = uow._session.get(Producto, producto_id)
        if not producto or producto.deleted:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        producto.deleted = True
        uow._session.flush()
