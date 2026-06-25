import { BrowserRouter, Routes, Route } from "react-router-dom";
import PaginaProductos from "./pages/ProductosPage";
import PaginaLogin from "./pages/PaginaLogin";
import PaginaCarrito from "./pages/PaginaCarrito";
import PaginaPedidos from "./pages/PaginaPedidos";
import PaginaDetallePedido from "./pages/PaginaDetallePedido";
import PaginaDirecciones from "./pages/PaginaDirecciones";


export default function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element= { <PaginaProductos/> }/>
        <Route path="/login" element= { <PaginaLogin/> }/>
        <Route path="/carrito" element= { <PaginaCarrito/> }/>
        <Route path="/pedidos" element= { <PaginaPedidos/> }/>
        <Route path="/pedidos/:id" element= { <PaginaDetallePedido/> }/>
        <Route path="/direcciones" element= { <PaginaDirecciones/> }/>
      </Routes>
    </BrowserRouter>
  );
}
