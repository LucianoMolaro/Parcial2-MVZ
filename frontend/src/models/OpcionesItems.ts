export interface menuItems{
    label: string
    path: string
    roles: string[]
}

export interface filtrosItems{
    para:string
    nombre: string
    divisiones: string[]
    roles: string[]
}

export const menuitems: menuItems[] = [
        {
            label: "Dashboard",
            path: "/admin/dashboard",
            roles: ["ADMIN"]
        },
        {
            label: "Usuarios",
            path: "/admin/usuarios",
            roles: ["ADMIN"]
        },
        {
            label: "Productos",
            path: "/admin/productos",
            roles: ["ADMIN"]
        },
        {
            label: "Catalogo",
            path: "/",
            roles: ["CLIENTE", "GUEST", "ADMIN"],
        },
        {
            label: "Pedidos",
            path: "/pedidos",
            roles: ["CLIENTE", "ADMIN"]
        },
        {
            label: "Direcciones",
            path: "/direcciones",
            roles: ["CLIENTE"]
        },
        {
            label: "Carrito",
            path: "/carrito",
            roles: ["CLIENTE"]
        },
        {
            label: "Ingredientes",
            path: "/admin/ingredientes",
            roles: ["ADMIN"]
        },
        {
            label: "Categorias",
            path: "/admin/categorias",
            roles: ["ADMIN"]
        }
    ]

export const filtroitems: filtrosItems[] = [
        {
            para:"Producto",
            nombre: "Precio",
            divisiones: ["Menor a mayor", "Mayor a menor"],
            roles: ["CLIENT", "GUEST", "ADMIN"],
        },
        {
            para:"Producto",
            nombre: "Stock",
            divisiones: ["Hay stock", "No hay stock", "Queda poco stock"],
            roles: ["CLIENT", "GUEST", "ADMIN"]
        },
        {
            para:"Producto",
            nombre: "Alergeno",
            divisiones: ["Es alergeno", "No es alergeno"],
            roles: ["ADMIN"]
        },
        {
            para:"Producto",
            nombre: "ID",
            divisiones: ["Ascendente", "Descendente"],
            roles:  ["ADMIN"]
        },
        {
            para:"Producto",
            nombre:"Estado",
            divisiones: ["Habilitados", "Deshabilitados"],
            roles: ["ADMIN"]
        }
    ]