import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import CategoriasPage from "./pages/CategoriasPage";
import IngredientesPage from "./pages/IngredientesPage";
import ProductosPage from "./pages/ProductosPage";
import PedidosPage from "./pages/PedidosPage";
import ClientePage from "./pages/ClientePage";

const queryClient = new QueryClient();

function getRole() { return localStorage.getItem("rol") ?? ""; }
function isLoggedIn() { return !!localStorage.getItem("rol"); }

function defaultPage(rol: string) {
  if (rol === "CLIENT") return "/catalogo";
  if (rol === "ADMIN" || rol === "PEDIDOS") return "/pedidos";
  if (rol === "STOCK") return "/productos";
  return "/catalogo";
}

export default function App() {
  const rol = getRole();
  const loggedIn = isLoggedIn();

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {loggedIn && <Navbar />}
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={loggedIn ? <Navigate to={defaultPage(rol)} /> : <Navigate to="/login" />} />

          <Route path="/catalogo" element={loggedIn ? <ClientePage /> : <Navigate to="/login" />} />

          <Route path="/pedidos" element={loggedIn && (rol === "ADMIN" || rol === "PEDIDOS") ? <PedidosPage /> : <Navigate to="/login" />} />
          <Route path="/ingredientes" element={loggedIn && (rol === "ADMIN" || rol === "STOCK") ? <IngredientesPage /> : <Navigate to="/login" />} />
          <Route path="/productos" element={loggedIn && (rol === "ADMIN" || rol === "STOCK") ? <ProductosPage /> : <Navigate to="/login" />} />
          <Route path="/categorias" element={loggedIn && rol === "ADMIN" ? <CategoriasPage /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
