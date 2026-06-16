import { DireccionEntrega } from "./DireccionEntrega"
import { Rol } from "./Rol"

export interface Usuario{
    id: number
    nombre: string
    apellido: string
    email: string
    celular: number | null
    username: string
    habilitado: boolean
    direcciones: DireccionEntrega[]
    roles: Rol[]
}