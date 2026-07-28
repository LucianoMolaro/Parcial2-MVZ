from typing import List

from fastapi import HTTPException

from app.core.UnitOfWork import UnitOfWork
from app.modules.Producto.model import Producto
from app.modules.Producto.schema import ProductoCreate, ProductoDisponibilidadUpdate
from app.modules.ProductoCategoria.model import ProductoCategoria
from app.modules.ProductoIngrediente.model import ProductoIngrediente


def get_productos(uow: UnitOfWork, es_admin: bool, page: int) -> List[Producto]:
    offset = (page - 1) * 5
    return uow.productos.get_productos_filtrado(es_admin, offset, 5)


def get_by_id(uow: UnitOfWork, producto_id: int) -> Producto:
    producto = uow.productos.get_habilitado(producto_id)
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return producto


def _calcular_stock(uow: UnitOfWork, data: ProductoCreate) -> int:
    # Producto final (sin ingredientes): el stock es el que carga el usuario a mano.
    if not data.ingredientes:
        return data.stock_cantidad

    # Producto con ingredientes: el stock depende de lo que alcance a cubrir
    # el ingrediente más escaso (ej: si la pizza usa 200g de queso y hay
    # 150g, solo alcanza para 0 pizzas).
    disponibles = []
    for item in data.ingredientes:
        ingrediente = uow.ingredientes.get_by_id(item.ingrediente_id)
        disponibles.append(int(ingrediente.stock_cantidad // item.cantidad))
    return min(disponibles)


def create(uow: UnitOfWork, data: ProductoCreate) -> Producto:
    with uow:
        producto = Producto(
            nombre=data.nombre,
            precio=data.precio,
            descripcion=data.descripcion,
            disponible=data.disponible,
            stock_cantidad=_calcular_stock(uow, data),
        )
        uow.productos.add(producto)

        for cat in data.categorias:
            uow.producto_categorias.add(ProductoCategoria(
                producto_id=producto.id,
                categoria_id=cat.categoria_id,
                es_principal=cat.principal,
            ))

        for item in data.ingredientes:
            uow.producto_ingredientes.add(ProductoIngrediente(
                producto_id=producto.id,
                ingrediente_id=item.ingrediente_id,
                cantidad=item.cantidad,
                es_removible=item.es_removible,
            ))

        return producto


def update(uow: UnitOfWork, producto_id: int, data: ProductoCreate) -> Producto:
    with uow:
        producto = uow.productos.get_habilitado(producto_id)
        if not producto:
            raise HTTPException(status_code=404, detail="Producto no encontrado")

        producto.nombre = data.nombre
        producto.precio = data.precio
        producto.descripcion = data.descripcion
        producto.disponible = data.disponible
        producto.stock_cantidad = _calcular_stock(uow, data)

        for link in uow.producto_categorias.get_by_producto(producto_id):
            uow.producto_categorias.delete(link)
        for link in uow.producto_ingredientes.get_by_producto(producto_id):
            uow.producto_ingredientes.delete(link)

        for cat in data.categorias:
            uow.producto_categorias.add(ProductoCategoria(
                producto_id=producto.id,
                categoria_id=cat.categoria_id,
                es_principal=cat.principal,
            ))
        for item in data.ingredientes:
            uow.producto_ingredientes.add(ProductoIngrediente(
                producto_id=producto.id,
                ingrediente_id=item.ingrediente_id,
                cantidad=item.cantidad,
                es_removible=item.es_removible,
            ))

        return producto


def update_disponibilidad(uow: UnitOfWork, producto_id: int, data: ProductoDisponibilidadUpdate) -> Producto:
    with uow:
        producto = uow.productos.get_habilitado(producto_id)
        if not producto:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        producto.stock_cantidad = data.stock_cantidad
        producto.disponible = data.disponible
        return producto


def reactivar(uow: UnitOfWork, producto_id: int) -> Producto:
    with uow:
        producto = uow.productos.get_by_id(producto_id)
        if not producto:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        producto.habilitado = True
        return producto


def update_imagen(uow: UnitOfWork, producto_id: int, imagen_url: str) -> Producto:
    with uow:
        producto = uow.productos.get_habilitado(producto_id)
        if not producto:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        if imagen_url not in producto.imagenes_url:
            producto.imagenes_url = producto.imagenes_url + [imagen_url]
        return producto


def delete(uow: UnitOfWork, producto_id: int) -> None:
    with uow:
        producto = uow.productos.get_habilitado(producto_id)
        if not producto:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        uow.productos.softDelete(producto)