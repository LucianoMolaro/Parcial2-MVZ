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
            label: "Productos",
            path: "/",
            roles: ["CLIENT", "GUEST"],
        },
        {
            label: "Pedidos",
            path: "/pedidos",
            roles: ["CLIENT"]
        },
        {
            label: "Direcciones",
            path: "/direcciones",
            roles: ["CLIENT"]
        },
        {
            label: "Carrito",
            path: "/carrito",
            roles: ["CLIENT"]
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
            nombre: "id",
            divisiones: ["Ascendente", "Descendente"],
            roles:  ["ADMIN"]
        },
        {
            para:"Producto",
            nombre:"Habilitado",
            divisiones: ["Esta habilitado", "Esta deshabilitado"],
            roles: ["ADMIN"]
        }
    ]