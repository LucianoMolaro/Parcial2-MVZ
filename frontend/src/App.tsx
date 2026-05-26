import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Navbar from "./components/Navbar";

import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import CategoriasPage from "./pages/CategoriasPage";
import IngredientesPage from "./pages/IngredientesPage";
import ProductosPage from "./pages/ProductosPage";
import ProductoDetallePage from "./pages/ProductoDetallePage";

const queryClient = new QueryClient();

// 🔐 función simple para saber si está logueado
const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>

        {/* 👇 opcional: ocultar navbar si no está logueado */}
        {isAuthenticated() && <Navbar />}

        <Routes>
          {/* 🔐 login */}
          <Route path="/login" element={<LoginPage />} />

          {/* 👇 redirige root */}
          <Route
            path="/"
            element={
              isAuthenticated() ? <HomePage /> : <Navigate to="/login" />
            }
          />

          {/* 🔒 rutas protegidas */}
          <Route
            path="/categorias"
            element={isAuthenticated() ? <CategoriasPage /> : <Navigate to="/login" />}
          />

          <Route
            path="/ingredientes"
            element={isAuthenticated() ? <IngredientesPage /> : <Navigate to="/login" />}
          />

          <Route
            path="/productos"
            element={isAuthenticated() ? <ProductosPage /> : <Navigate to="/login" />}
          />

          <Route
            path="/productos/:id"
            element={isAuthenticated() ? <ProductoDetallePage /> : <Navigate to="/login" />}
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}