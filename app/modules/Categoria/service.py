from typing import Any, List, Optional
from fastapi import HTTPException

from app.core.UnitOfWork import UnitOfWork
from app.modules.Categoria.model import Categoria
from app.modules.Categoria.schema import CategoriaCreate, CategoriaRead
from app.modules.Cloudinary.model import Imagen
from app.modules.Usuario.model import Usuario


def get_principales_admin(uow: UnitOfWork):
    return uow.categoria.get_principales(Categoria.parent == None)

def get_principales_catalogo(uow: UnitOfWork):        
    return uow.categoria.get_principales(Categoria.habilitado==True, Categoria.parent == None)

def get_por_padre(uow: UnitOfWork, current_user: Usuario, pid: int):

    roles = [rol.codigo for rol in current_user.roles]
    match roles:
        case ["ADMIN"]:
            return uow.categoria.get_por_padre(Categoria.parent_id == pid)
        case _:
            return uow.categoria.get_por_padre(Categoria.habilitado==True, Categoria.parent_id == pid)        
    

def get_by_id(uow: UnitOfWork, categoria_id: int) -> Categoria:
    c = uow.categoria.get_habilitada(categoria_id)
    if not c:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    return c



def get_arbol(uow: UnitOfWork, categoria_id: id):
    categoria_actual = uow.categoria.get_by_id(categoria_id)
    
    if not categoria_actual:
        return []
        
    arbol_ruta = []
    
    while categoria_actual:
        arbol_ruta.append(categoria_actual)
        categoria_actual = categoria_actual.parent 

    arbol_ruta.reverse()
    return arbol_ruta




def create(uow: UnitOfWork, data: CategoriaCreate) -> Categoria:
    with uow:
        if data.parent_id and not uow.categoria.get_by_id(data.parent_id):
            raise HTTPException(status_code=404, detail="Categoría padre no encontrada")
        nueva = Categoria(
            nombre=data.nombre,
            descripcion=data.descripcion,
            parent_id=data.parent_id,
            cloudinary=Imagen(
                url=data.cloudinary.url,
                public_id=data.cloudinary.public_id
            ),
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