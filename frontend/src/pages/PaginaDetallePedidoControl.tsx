import { useParams } from "react-router-dom";

export default function PaginaDetallePedidoControl(){
    const { id } = useParams<{ id: string }>();

    
    return (<div>hola</div>)
}