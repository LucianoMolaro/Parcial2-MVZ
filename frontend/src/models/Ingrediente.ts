import { UnidadMedidaSchema } from "./UnidadMedida";

export interface IngredienteSchema {
  id: number;
  nombre: string;
  unidad_medida: UnidadMedidaSchema;
  es_alergeno: boolean;
  stock_cantidad: number;
}