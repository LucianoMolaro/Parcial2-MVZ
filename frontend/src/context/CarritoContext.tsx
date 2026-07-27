import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  ReactNode,
  Dispatch,
} from "react";



import { CarritoState } from "../models/Carrito";
import { cargarDesdeStorage, CarritoAction, carritoEstadoInicial, carritoReducer, guardarEnStorage } from "../reducers/CarritoReducer";
import { detallePedido } from "../models/DetallePedido";

// ==================== Tipos del contexto ====================

interface CarritoContextValue {
  state: CarritoState;
  dispatch: Dispatch<CarritoAction>;
  agregar: (id: number, cantidad?: number) => void;
  incrementar: (id: number) => void;
  decrementar: (id: number) => void;
  quitarIngrediente: (id: number, ingredienteId: number) => void;
  restaurarIngrediente: (id: number, ingredienteId: number) => void;
  eliminar: (id: number) => void;
  resetear: () => void;
  getItem: (id: number) => detallePedido | undefined;
  cantidadDeItem: (id: number) => number;
  ingredienteQuitado: (id: number, ingredienteId: number) => boolean;
}

// ==================== Contexto ====================

const CarritoContext = createContext<CarritoContextValue | null>(null);

// ==================== Provider ====================

export function CarritoProvider({ children }: { children: ReactNode }) {
  // Carga el estado desde localStorage al montar (si no hay nada, usa el inicial)
  const [state, dispatch] = useReducer(carritoReducer, carritoEstadoInicial, cargarDesdeStorage);

  // Persiste en localStorage cada vez que el estado cambia
  useEffect(() => {
    guardarEnStorage(state);
  }, [state]);

  const agregar = useCallback((id: number, cantidad = 1) => {
    dispatch({ type: "AGREGAR", payload: { id, cantidad } });
  }, []);

  const incrementar = useCallback((id: number) => {
    dispatch({ type: "INCREMENTAR", payload: { id } });
  }, []);

  const decrementar = useCallback((id: number) => {
    dispatch({ type: "DECREMENTAR", payload: { id } });
  }, []);

  const quitarIngrediente = useCallback((id: number, ingredienteId: number) => {
    dispatch({ type: "QUITAR_INGREDIENTE", payload: { id, ingredienteId } });
  }, []);

  const restaurarIngrediente = useCallback((id: number, ingredienteId: number) => {
    dispatch({ type: "RESTAURAR_INGREDIENTE", payload: { id, ingredienteId } });
  }, []);

  const eliminar = useCallback((id: number) => {
    dispatch({ type: "ELIMINAR", payload: { id } });
  }, []);

  const resetear = useCallback(() => {
    dispatch({ type: "RESETEAR" });
  }, []);

  const getItem = useCallback(
    (id: number) => state.items.find((i: detallePedido) => i.producto_id === id),
    [state.items]
  );

  const cantidadDeItem = useCallback(
    (id: number) => state.items.find((i: detallePedido) => i.producto_id === id)?.cantidad ?? 0,
    [state.items]
  );

  const ingredienteQuitado = useCallback(
    (id: number, ingredienteId: number) =>
      state.items.find((i: detallePedido) => i.producto_id === id)?.personalizacion.includes(ingredienteId) ?? false,
    [state.items]
  );

  return (
    <CarritoContext.Provider
      value={{
        state,
        dispatch,
        agregar,
        incrementar,
        decrementar,
        quitarIngrediente,
        restaurarIngrediente,
        eliminar,
        resetear,
        getItem,
        cantidadDeItem,
        ingredienteQuitado,
      }}
    >
      {children}
    </CarritoContext.Provider>
  );
}

// ==================== Hook ====================

export function useCarrito(): CarritoContextValue {
  const ctx = useContext(CarritoContext);
  if (!ctx) throw new Error("useCarrito debe usarse dentro de <CarritoProvider>");
  return ctx;
}