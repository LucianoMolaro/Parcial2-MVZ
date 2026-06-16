import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import ProductosPage from "./pages/ProductosPage";
import { useAuthUser } from "./context/AuthContext";
import ListaUsuarios from "./pages/ListaUsuarios";
import PedidosPage from "./pages/PedidosPage";
import IngredientesPage from "./pages/IngredientesPage";


export default function App() {
  const { user } = useAuthUser()
  const roles = user?.roles.map(rol => rol.codigo) || []
  const logeado = !!user

  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ProductosPage></ProductosPage>}/>

          <Route path="/login" element={<LoginPage />} />

          <Route path="/listaUsuarios" element={logeado && roles.includes("ADMIN") ? <ListaUsuarios /> : <ProductosPage />} />

          <Route path="/ingredientes" element={logeado && (roles.includes("STOCK") || roles.includes("ADMIN")) ? <IngredientesPage /> : <LoginPage />} />

          <Route path="/pedidos" element={logeado && (roles.includes("PEDIDOS") || roles.includes("ADMIN")) ? <PedidosPage /> : <LoginPage />} />

          <Route path="/productos" element={logeado && (roles.includes("CLIENT") || roles.includes("ADMIN")) ? <ProductosPage /> : <LoginPage />} />
        </Routes>
      </BrowserRouter>
  );
}
