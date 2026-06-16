from typing import List, Optional

from fastapi import HTTPException

from app.core.UnitOfWork import UnitOfWork
from app.modules.Categoria.schema import CategoriaRead
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
    categorias = []
    for link in uow.producto_categorias.get_by_producto(producto.id):
        cat = uow.categoria.get_by_id(link.categoria_id)
        if cat:
            categorias.append(CategoriaRead.model_validate(cat))

    ingredientes = []
    for link in uow.producto_ingredientes.get_by_producto(producto.id):
        ing = uow.ingredientes.get_by_id(link.ingrediente_id)
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
    return [_cargar(uow, p) for p in uow.productos.get_productos_filtrado(es_admin, offset, 5)]


def get_by_id(uow: UnitOfWork, producto_id: int) -> ProductoRead:
    producto = uow.productos.get_habilitado(producto_id)
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return _cargar(uow, producto)


def create(uow: UnitOfWork, data: ProductoCreate) -> ProductoRead:
    with uow:
        producto = Producto(
            nombre=data.nombre, precio=data.precio, descripcion=data.descripcion,
            disponible=data.disponible, stock_cantidad=data.stock_cantidad,
        )
        uow.productos.add(producto)

        for cat_id in data.categoria_ids:
            if not uow.categoria.get_by_id(cat_id):
                raise HTTPException(status_code=404, detail=f"Categoría {cat_id} no encontrada")
            uow.producto_categorias.add(ProductoCategoria(producto_id=producto.id, categoria_id=cat_id))

        for item in data.ingredientes:
            if not uow.ingredientes.get_by_id(item.ingrediente_id):
                raise HTTPException(status_code=404, detail=f"Ingrediente {item.ingrediente_id} no encontrado")
            uow.producto_ingredientes.add(ProductoIngrediente(
                producto_id=producto.id,
                ingrediente_id=item.ingrediente_id,
                cantidad=item.cantidad,
            ))
        return _cargar(uow, producto)


def update(uow: UnitOfWork, producto_id: int, data: ProductoCreate) -> ProductoRead:
    with uow:
        producto = uow.productos.get_habilitado(producto_id)
        if not producto:
            raise HTTPException(status_code=404, detail="Producto no encontrado")

        producto.nombre = data.nombre
        producto.precio = data.precio
        producto.descripcion = data.descripcion
        producto.disponible = data.disponible
        producto.stock_cantidad = data.stock_cantidad

        for link in uow.producto_categorias.get_by_producto(producto_id):
            uow.producto_categorias.delete(link)
        for link in uow.producto_ingredientes.get_by_producto(producto_id):
            uow.producto_ingredientes.delete(link)

        for cat_id in data.categoria_ids:
            uow.producto_categorias.add(ProductoCategoria(producto_id=producto.id, categoria_id=cat_id))
        for item in data.ingredientes:
            uow.producto_ingredientes.add(ProductoIngrediente(
                producto_id=producto.id,
                ingrediente_id=item.ingrediente_id,
                cantidad=item.cantidad,
            ))
        return _cargar(uow, producto)


def update_disponibilidad(uow: UnitOfWork, producto_id: int, data: ProductoDisponibilidadUpdate) -> ProductoRead:
    with uow:
        producto = uow.productos.get_habilitado(producto_id)
        if not producto:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        producto.stock_cantidad = data.stock_cantidad
        producto.disponible = data.disponible
        return _cargar(uow, producto)


def reactivar(uow: UnitOfWork, producto_id: int) -> ProductoRead:
    with uow:
        producto = uow.productos.get_by_id(producto_id)
        if not producto:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        producto.habilitado = True
        return _cargar(uow, producto)


def delete(uow: UnitOfWork, producto_id: int) -> None:
    with uow:
        producto = uow.productos.get_habilitado(producto_id)
        if not producto:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        uow.productos.softDelete(producto)
