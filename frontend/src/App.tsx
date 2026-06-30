import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import PaginaLogin from "./pages/PaginaLogin";
import PaginaCarrito from "./pages/PaginaCarrito";
import PaginaPedidos from "./pages/PaginaPedidos";
import PaginaDetallePedido from "./pages/PaginaDetallePedido";
import PaginaDirecciones from "./pages/PaginaDirecciones";
import PaginaIngredientes from "./pages/PaginaIngredientes";
import PaginaCategorias from "./pages/PaginaCategorias";
import PaginaDashboard from "./pages/PaginaDashboard";
import PaginaCatalogo from "./pages/ProductosPage";
import PrivateRoute from "./PrivateRoute";
import PaginaRegistro from "./pages/PaginaRegistro";
import PaginaProductosAdmin from "./pages/PaginaProductosAdmin";
import PaginaIngredientesAdmin from "./pages/PaginaIngredientesAdmin";
import PaginaUsuariosAdmin from "./pages/PaginaUsuariosAdmin";
import { useAuthUser } from "./context/AuthContext";
import { useWebSocket } from "./context/WebSocketContext";


export default function App() {
  const { user } = useAuthUser();
  const { connect, disconnect, joinRoom, status } = useWebSocket();

  useEffect(() => {
    if (user) {
      connect(`ws://localhost:8000/ws/${user.id}`, String(user.id));
    } else {
      disconnect();
    }
  }, [user?.id]);

  useEffect(() => {
    if (status !== "connected" || !user) return;
    joinRoom(`pedido_${user.id}`);
    const esAdmin = user.roles?.some(r => r.codigo === "ADMIN" || r.codigo === "PEDIDOS");
    if (esAdmin) joinRoom("pedidos_admin");
  }, [status, user?.id]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element= { <PaginaCatalogo/> }/>
        <Route path="/login" element= { <PaginaLogin/> }/>
        <Route path="/registro" element= { <PaginaRegistro/> }/>
        <Route path="/carrito" element= { <PrivateRoute rol={["CLIENT"]}><PaginaCarrito/></PrivateRoute>}/>
        <Route path="/pedidos" element= { <PrivateRoute rol={["CLIENTE", "PEDIDOS", "ADMIN"]}><PaginaPedidos/></PrivateRoute> }/>
        <Route path="/pedidos/:id" element= { <PrivateRoute rol={["CLIENTE", "PEDIDOS"]}><PaginaDetallePedido/></PrivateRoute> }/>
        <Route path="/direcciones" element= {  <PrivateRoute rol={["CLIENTE"]}><PaginaDirecciones/></PrivateRoute> }/>
        <Route path="/admin/ingredientes" element= {  <PrivateRoute rol={["ADMIN", "STOCK"]}><PaginaIngredientesAdmin/></PrivateRoute>  }/>
        <Route path="/admin/categorias" element= { <PrivateRoute rol={["ADMIN"]}><PaginaCategorias/></PrivateRoute>  }/>
        <Route path="/admin/dashboard" element= { <PrivateRoute rol={["ADMIN"]}><PaginaDashboard/></PrivateRoute> }/>
        <Route path="/admin/productos" element= { <PrivateRoute rol={["ADMIN"]}><PaginaProductosAdmin/></PrivateRoute> }/>
        <Route path="/admin/usuarios" element= { <PrivateRoute rol={["ADMIN"]}><PaginaUsuariosAdmin/></PrivateRoute> }/>
      </Routes>
    </BrowserRouter>
  );
}
