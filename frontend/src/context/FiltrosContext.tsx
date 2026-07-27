/**
 * FiltrosContext
 * Reducer + Context para la gestión de filtros de PaginaProductos.
 * Respeta exactamente las reglas de negocio actuales:
 *  - nivelActualId controla qué nivel del árbol de categorías muestra el carrusel
 *  - categoriaFiltradaId controla el filtrado real de productos
 *  - Ambos cambian de forma atómica en cada acción
 */

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  ReactNode,
  Dispatch,
} from "react";
import { filtroitems, filtrosItems } from "../models/OpcionesItems";
import { useAuthUser } from "./AuthContext";

// ==================== Tipos ====================

export interface FiltrosState {
  para: string
  /** ID del nivel del árbol que muestra el carrusel (null = raíz) */
  nivelActualId: string | null;
  /** ID de la categoría que filtra los productos ('todos' = sin filtro) */
  categoriaFiltradaId: string;
  /** Criterio de ordenamiento/filtro seleccionado (ej: "Precio") */
  criterioSeleccionado: string;
  /** División específica del criterio (ej: "Ascendente") */
  divisionSeleccionada: string;
  /** Texto de búsqueda libre */
  busqueda: string;
  /** Página actual de la paginación */
  pagina: number;
  /** Opciones de filtro visibles según el rol del usuario */
  filtroOpciones: filtrosItems[];
}

export type FiltrosAction =
  /** Navega a una subcategoría con hijos: actualiza el nivel del carrusel Y el filtro */
  | {
      type: "FILTRAR_CATEGORIA_CON_HIJOS";
      payload: { categoriaId: string };
    }
  /** Selecciona una categoría hoja (sin hijos): solo actualiza el filtro, no el nivel */
  | {
      type: "FILTRAR_CATEGORIA_HOJA";
      payload: { categoriaId: string };
    }
  /** Filtra por la categoría padre del nivel actual (tarjeta "Todos" dentro de un nivel) */
  | {
      type: "FILTRAR_PADRE_ACTUAL";
      payload: { padreId: string };
    }
  /** Retrocede un nivel en el árbol de categorías */
  | {
      type: "VOLVER_NIVEL";
      payload: { nuevoPadreId: string | null };
    }
  /** Cambia el criterio de ordenamiento principal */
  | { type: "SET_CRITERIO"; payload: string }
  /** Cambia la división del criterio activo */
  | { type: "SET_DIVISION"; payload: string }
  /** Actualiza el texto de búsqueda */
  | { type: "SET_BUSQUEDA"; payload: string }
  /** Cambia la página activa */
  | { type: "SET_PAGINA"; payload: number }
  /** Setea las opciones de filtro según el rol (se llama al cargar el usuario) */
  | { type: "SET_FILTRO_OPCIONES"; payload: filtrosItems[] }
  /** Limpia absolutamente todos los filtros al estado inicial */
  | { type: "LIMPIAR" };

// ==================== Estado inicial ====================

const estadoInicial: FiltrosState = {
  para:"",
  nivelActualId: null,
  categoriaFiltradaId: "todos",
  criterioSeleccionado: "",
  divisionSeleccionada: "",
  busqueda: "",
  pagina: 1,
  filtroOpciones: [],
};

// ==================== Reducer ====================

function filtrosReducer(state: FiltrosState, action: FiltrosAction): FiltrosState {
  switch (action.type) {

    // El usuario clickeó una categoría que TIENE hijos:
    // → el carrusel baja un nivel (nivelActualId = esa categoría)
    // → los productos se filtran por esa categoría
    case "FILTRAR_CATEGORIA_CON_HIJOS":
      return {
        ...state,
        nivelActualId: action.payload.categoriaId,
        categoriaFiltradaId: action.payload.categoriaId,
        pagina: 1,
      };

    // El usuario clickeó una categoría que NO tiene hijos (hoja):
    // → el carrusel NO cambia de nivel
    // → solo se actualiza el filtro de productos
    case "FILTRAR_CATEGORIA_HOJA":
      return {
        ...state,
        categoriaFiltradaId: action.payload.categoriaId,
        pagina: 1,
      };

    // El usuario clickeó la tarjeta del padre (ej: "Burgers" dentro del nivel de Burgers):
    // → filtra todo lo de ese padre sin bajar más
    case "FILTRAR_PADRE_ACTUAL":
      return {
        ...state,
        categoriaFiltradaId: action.payload.padreId,
        pagina: 1,
      };

    // El usuario clickeó "Volver":
    // → sube un nivel en el carrusel
    // → el filtro se resetea al padre (o 'todos' si volvemos a la raíz)
    case "VOLVER_NIVEL":
      return {
        ...state,
        nivelActualId: action.payload.nuevoPadreId,
        categoriaFiltradaId: action.payload.nuevoPadreId ?? "todos",
        pagina: 1,
      };

    case "SET_CRITERIO":
      return {
        ...state,
        criterioSeleccionado: action.payload,
        divisionSeleccionada: "", // resetea la división al cambiar criterio
        pagina: 1,
      };

    case "SET_DIVISION":
      return {
        ...state,
        divisionSeleccionada: action.payload,
        pagina: 1,
      };

    case "SET_BUSQUEDA":
      return {
        ...state,
        busqueda: action.payload,
        pagina: 1,
      };

    case "SET_PAGINA":
      return {
        ...state,
        pagina: action.payload,
      };

    case "SET_FILTRO_OPCIONES":
      return {
        ...state,
        filtroOpciones: action.payload,
      };

    // limpiarFiltros() — vuelve exactamente al estado inicial
    case "LIMPIAR":
      return {
        ...estadoInicial,
        filtroOpciones: state.filtroOpciones, // preserva las opciones del rol
      };

    default:
      return state;
  }
}

// ==================== Contexto ====================

interface FiltrosContextValue {
  state: FiltrosState;
  dispatch: Dispatch<FiltrosAction>;
  /** Shorthand: limpia todos los filtros */
  limpiarFiltros: () => void;
}

const FiltrosContext = createContext<FiltrosContextValue | null>(null);

// ==================== Provider ====================

export function FiltrosProvider({ children }: { children: ReactNode }) {
  const { user } = useAuthUser();
  const [state, dispatch] = useReducer(filtrosReducer, estadoInicial);

  // Reproduce el useEffect original: actualiza las opciones de filtro según el rol
  useEffect(() => {
    const roles = user?.roles.map((rol) => rol.codigo) ?? ["ADMIN"];
    const filtrosVisibles = filtroitems.filter((item) =>
      roles.some((rol) => item.roles.includes(rol) )
    );
    dispatch({ type: "SET_FILTRO_OPCIONES", payload: filtrosVisibles });
  }, [user]);

  const limpiarFiltros = useCallback(() => {
    dispatch({ type: "LIMPIAR" });
  }, []);

  return (
    <FiltrosContext.Provider value={{ state, dispatch, limpiarFiltros }}>
      {children}
    </FiltrosContext.Provider>
  );
}

// ==================== Hook ====================

/**
 * Accede al estado y las acciones de filtros.
 * Debe usarse dentro de <FiltrosProvider>.
 */
export function useFiltros(): FiltrosContextValue {
  const ctx = useContext(FiltrosContext);
  if (!ctx) {
    throw new Error("useFiltros debe usarse dentro de <FiltrosProvider>");
  }
  return ctx;
}