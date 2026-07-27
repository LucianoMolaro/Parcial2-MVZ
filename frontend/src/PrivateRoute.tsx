import { Navigate } from 'react-router-dom'
import { useAuthUser } from './context/AuthContext'
import { ReactNode } from 'react'
interface Prop{
  children: ReactNode
  rol?: string[] 
}


export default function PrivateRoute({ children, rol }: Prop) {
    const { user } = useAuthUser()
    const rolesPermitidos = rol;

    const tieneRol = user?.roles.some(r =>
      rolesPermitidos?.includes(r.codigo)
    );

  if (!user) {
    return <Navigate to="/login" />
  }


  if (rol && !tieneRol) {
    alert("No tienes permiso para ingresar a esta pagina")
    return <Navigate to="/" />
  }

  return children
}

