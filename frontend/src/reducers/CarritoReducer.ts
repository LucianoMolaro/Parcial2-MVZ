import { CarritoState } from "../models/Carrito";
import { detallePedido } from "../models/DetallePedido";


export type CarritoAction =
  | { type: "AGREGAR"; payload: { id: number; cantidad?: number } }
  | { type: "INCREMENTAR"; payload: { id: number } }
  | { type: "DECREMENTAR"; payload: { id: number } }
  | { type: "QUITAR_INGREDIENTE"; payload: { id: number; ingredienteId: number } }
  | { type: "RESTAURAR_INGREDIENTE"; payload: { id: number; ingredienteId: number } }
  | { type: "ELIMINAR"; payload: { id: number } }
  | { type: "RESETEAR" };

// ==================== localStorage ====================

const STORAGE_KEY = "carrito";

export function cargarDesdeStorage(): CarritoState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return carritoEstadoInicial;
    return JSON.parse(raw) as CarritoState;
  } catch {
    return carritoEstadoInicial;
  }
}

export function guardarEnStorage(state: CarritoState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    console.warn("[Carrito] No se pudo guardar en localStorage");
  }
}

// ==================== Estado inicial ====================

export const carritoEstadoInicial: CarritoState = {
  items: [],
  totalUnidades: 0,
};

// ==================== Helpers ====================

function calcularTotalUnidades(items: detallePedido[]): number {
  return items.reduce((acc: number, item: detallePedido) => acc + item.cantidad, 0);
}

// ==================== Reducer ====================

export function carritoReducer(
  state: CarritoState,
  action: CarritoAction
): CarritoState {
  let nuevosItems: detallePedido[];

  switch (action.type) {

    case "AGREGAR": {
      const cantidad = action.payload.cantidad ?? 1;
      const existe = state.items.find((i: detallePedido) => i.producto_id === action.payload.id);

      if (existe) {
        nuevosItems = state.items.map((i: detallePedido) =>
          i.producto_id === action.payload.id
            ? { ...i, cantidad: i.cantidad + cantidad }
            : i
        );
      } else {
        nuevosItems = [
          ...state.items,
          { producto_id: action.payload.id, cantidad, personalizacion: [] },
        ];
      }
      break;
    }

    case "INCREMENTAR": {
      nuevosItems = state.items.map((i: detallePedido) =>
        i.producto_id === action.payload.id ? { ...i, cantidad: i.cantidad + 1 } : i
      );
      break;
    }

    case "DECREMENTAR": {
      nuevosItems = state.items
        .map((i: detallePedido) =>
          i.producto_id === action.payload.id ? { ...i, cantidad: i.cantidad - 1 } : i
        )
        .filter((i: detallePedido) => i.cantidad > 0);
      break;
    }

    case "QUITAR_INGREDIENTE": {
      nuevosItems = state.items.map((i: detallePedido) =>
        i.producto_id === action.payload.id && !i.personalizacion.includes(action.payload.ingredienteId)
          ? { ...i, personalizacion: [...i.personalizacion, action.payload.ingredienteId] }
          : i
      );
      break;
    }

    case "RESTAURAR_INGREDIENTE": {
      nuevosItems = state.items.map((i: detallePedido) =>
        i.producto_id === action.payload.id
          ? { ...i, personalizacion: i.personalizacion.filter((ing: number) => ing !== action.payload.ingredienteId) }
          : i
      );
      break;
    }

    case "ELIMINAR": {
      nuevosItems = state.items.filter((i: detallePedido) => i.producto_id !== action.payload.id);
      break;
    }

    case "RESETEAR":
      return carritoEstadoInicial;

    default:
      return state;
  }

  return {
    items: nuevosItems,
    totalUnidades: calcularTotalUnidades(nuevosItems),
  };
}