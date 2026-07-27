import { ProductoCarrito } from "./Producto"

export interface PedidoCreate{
    productos: ProductoCarrito[]
    direccion: number
    forma_pago: string
}