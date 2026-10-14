import { peticion } from './clienteHttp'

/**
 * Contrato del microservicio de Pedidos.
 *
 * - Las rutas reales cuelgan de `/api/v1/pedidos` (ver `app/pedidos.py`), no de
 *   `/pedidos` como aparece en algunos enunciados.
 * - La cotización es un calculo sin persistencia: `POST /api/v1/pedidos/cotizar`.
 * - El alta del pedido es `POST /api/v1/pedidos`.
 */

export interface Punto {
  latitud: number
  longitud: number
}

export interface DatosCotizacion {
  peso_kg: number
  origen: Punto
  destino: Punto
  es_fragil: boolean
  es_urgente: boolean
}

/** Desglose que devuelve el cotizador del backend (`app/cotizador.py`). */
export interface DesgloseCotizacion {
  tarifa_base: number
  costo_peso: number
  costo_distancia: number
  subtotal: number
  recargo_fragil: number
  recargo_urgente: number
}

export interface Cotizacion {
  distancia_km: number
  desglose: DesgloseCotizacion
  costo_total: number
}

export interface RespuestaCotizacion {
  message: string
  cotizacion: Cotizacion
}

export interface DatosPedido extends DatosCotizacion {
  cliente: string
  direccion: string
  categoria: string
  fecha_programada: string
  descripcion: string
  costo_total: number
  /**
   * Opcional: el backend lo acepta, pero el JWT no expone de forma confiable el
   * id numerico y no existe un /auth/me que lo devuelva.
   */
  usuario_id?: number
}

export interface PedidoRegistrado {
  id: number
  estado: string
  costo_total: number | null
  fecha_creacion: string | null
}

export interface RespuestaPedido {
  message: string
  pedido: PedidoRegistrado
  notificacion?: {
    exito?: boolean
    mensaje?: string
  }
}

/** Tarifa en vivo. No persiste nada: es el endpoint que la issue llama "cotización instantánea". */
export function cotizar(datos: DatosCotizacion): Promise<RespuestaCotizacion> {
  return peticion<RespuestaCotizacion>('/api/v1/pedidos/cotizar', {
    method: 'POST',
    body: datos,
  })
}

/** Registra el pedido y notifica al despachador del administrador. */
export function crearPedido(datos: DatosPedido): Promise<RespuestaPedido> {
  return peticion<RespuestaPedido>('/api/v1/pedidos', {
    method: 'POST',
    body: datos,
  })
}