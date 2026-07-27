import { detallePedido } from "./DetallePedido";

export interface CarritoState {
  items: detallePedido[];
  totalUnidades: number;
}