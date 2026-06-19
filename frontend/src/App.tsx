import { BrowserRouter, Routes, Route } from "react-router-dom";
<<<<<<< HEAD
// import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
// import CategoriasPage from "./pages/CategoriasPage";
import IngredientesPage from "./pages/IngredientesPage";
=======
import LoginPage from "./pages/LoginPage";
>>>>>>> 963d90eee5cc139a2bc81ca319867c5edb30dfbb
import ProductosPage from "./pages/ProductosPage";
import { useAuthUser } from "./context/AuthContext";
import ListaUsuarios from "./pages/ListaUsuarios";
import PedidosPage from "./pages/PedidosPage";
<<<<<<< HEAD
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
=======
import IngredientesPage from "./pages/IngredientesPage";
import ClientePage from "./pages/ClientePage";
import CategoriasPage from "./pages/CategoriasPage";

export default function App() {
  const { user } = useAuthUser();
  const roles = user?.roles.map((rol) => rol.codigo) || [];
  const logeado = !!user;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProductosPage />} />

        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/usuarios"
          element={logeado && roles.includes("ADMIN") ? <ListaUsuarios /> : <ProductosPage />}
        />

        <Route
          path="/ingredientes"
          element={
            logeado && (roles.includes("STOCK") || roles.includes("ADMIN"))
              ? <IngredientesPage />
              : <LoginPage />
          }
        />

        <Route
          path="/pedidos"
          element={
            logeado && (roles.includes("PEDIDOS") || roles.includes("ADMIN"))
              ? <PedidosPage />
              : <LoginPage />
          }
        />

        <Route
          path="/productos"
          element={
            logeado && (roles.includes("CLIENT") || roles.includes("ADMIN"))
              ? <ProductosPage />
              : <LoginPage />
          }
        />

        <Route
          path="/cliente"
          element={
            logeado && (roles.includes("CLIENT") || roles.includes("ADMIN"))
              ? <ClientePage />
              : <LoginPage />
          }
        />

        <Route
          path="/categorias"
          element={
            logeado && roles.includes("ADMIN")
              ? <CategoriasPage />
              : <ProductosPage />
          }
        />
      </Routes>
    </BrowserRouter>
>>>>>>> 963d90eee5cc139a2bc81ca319867c5edb30dfbb
  );
}
