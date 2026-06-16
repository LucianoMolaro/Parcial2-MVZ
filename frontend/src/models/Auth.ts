import { Usuario } from "./Usuario";

export interface AuthContextType {
  user: Usuario | null;
  loading: boolean;
  setUser: (user: Usuario | null) => void;
  login: (username: string, password: string) => Promise<void>;
  logout: ()=>Promise<void>;
};