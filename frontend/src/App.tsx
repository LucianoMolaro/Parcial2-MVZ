import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
// import CategoriasPage from "./pages/CategoriasPage";
import IngredientesPage from "./pages/IngredientesPage";
import ProductosPage from "./pages/ProductosPage";
import PedidosPage from "./pages/PedidosPage";
// import ClientePage from "./pages/ClientePage";
// import HomePage from "./pages/HomePage";

import { useAuthUser } from "./context/AuthContext";
import ListaUsuarios from "./pages/listaUsuarios";


export default function App() {
  const { user } = useAuthUser()
  const roles = user?.roles.map(rol => rol.codigo) || []
  const logeado = !!user

  return (
      <BrowserRouter>
        <Routes>

          <Route path="/listaUsuarios" element={logeado && roles.includes("ADMIN") ? <ListaUsuarios /> : <LoginPage />} />

          <Route path="/ingredientes" element={logeado && (roles.includes("STOCK") || roles.includes("ADMIN")) ? <IngredientesPage /> : <LoginPage />} />

          <Route path="/pedidos" element={logeado && (roles.includes("PEDIDOS") || roles.includes("ADMIN")) ? <PedidosPage /> : <LoginPage />} />

          <Route path="/productos" element={logeado && (roles.includes("CLIENT") || roles.includes("ADMIN")) ? <ProductosPage /> : <LoginPage />} />
          
          <Route path="*" element={<LoginPage />} />
        </Routes>
      </BrowserRouter>
  );
}
