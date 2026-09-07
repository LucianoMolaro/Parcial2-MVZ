import { UnidadMedidaRead } from "./UnidadMedida";

export interface IngredienteRead {
  id: number;
  nombre: string;
  precio:number;
  unidad_medida: UnidadMedidaRead;
  es_alergeno: boolean;
  stock_cantidad: number;
}

export interface IngredienteCreate {
  nombre: string;
  precio:number
  unidad_medida_id: number;
  es_alergeno: boolean;
  stock_cantidad: number;
}

