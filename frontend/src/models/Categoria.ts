export interface Categoria{
    id: number
    nombre: string
    descripcion: string
    habilitado: boolean
    categoria_padre?: Categoria
    categoria_hija?: Categoria
}
