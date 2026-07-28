import { UnidadMedidaSchema } from "./UnidadMedida";

export interface Ingrediente {
  id: number;
  nombre: string;
  unidad_medida?: UnidadMedidaSchema;
  es_alergeno: boolean;
  stock_cantidad: number;
}