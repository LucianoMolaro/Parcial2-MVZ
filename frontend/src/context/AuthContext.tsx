import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { AuthContextType } from "../models/Auth";
import { Usuario } from "../models/Usuario";

const AuthUserContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const cached = localStorage.getItem('auth_user');
    const [user, setUserState] = useState<Usuario | null>(cached ? JSON.parse(cached) : null);
    const [loading, setLoading] = useState(true);

    const setUser = (u: Usuario | null) => {
        if (u) localStorage.setItem('auth_user', JSON.stringify(u));
        else localStorage.removeItem('auth_user');
        setUserState(u);
    };

    useEffect(() => {
        const cargarUsuario = async () => {
            try {
                const res = await fetch("http://localhost:8000/auth/me", { credentials: "include" });
                if (res.ok) {
                    const data: Usuario = await res.json();
                    setUser(data);
                } else {
                    setUser(null);
                }
            } finally {
                setLoading(false);
            }
        };
        cargarUsuario();
    }, []);

    const login = async (username: string, password: string) => {
        const res = await fetch("http://localhost:8000/auth/login", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password}),
        });
        if (!res.ok) throw new Error("Error login");
        const data: Usuario = await res.json();
        setUser(data);
    };

    const logout = async () => {
        const res = await fetch("http://localhost:8000/auth/logout", {
            method: "POST",
            credentials: "include",
        });
        if (!res.ok) throw new Error("Error al salir");
        setUser(null);
    };

  return (
    <AuthUserContext.Provider value={{ user, setUser, login, loading, logout }}>
      {children}
    </AuthUserContext.Provider>
  );
};

export const useAuthUser = () => {
  const context = useContext(AuthUserContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro del AuthProvider");
  }
  return context;
};
