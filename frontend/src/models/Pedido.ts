export interface DetallePedido {
  pedido_id: number;
  producto_id: number;
  cantidad: number;
  nombre: string;
  precio: string;
  subtotal: string;
  personalizacion_nombres: string[];
}

export interface DireccionPedido {
  alias: string;
  calle1: string;
  altura: string;
  ciudad: string;
}

export interface Pedido {
  id: number;
  usuario_id: number;
  forma_pago_codigo: string;
  direccion: DireccionPedido | null;
  estado_codigo: string;
  subtotal: string;
  costo_envio: string;
  total: string;
  notas: string | null;
  created_at: string | null;
  detalles: DetallePedido[];
  init_point: string | null;
}