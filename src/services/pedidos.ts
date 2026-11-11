import { peticion } from './clienteHttp'

/**
 * Contrato del microservicio de Pedidos.
 *
 * - Las rutas reales cuelgan de `/api/v1/pedidos` (ver `app/pedidos.py`), no de
 *   `/pedidos` como aparece en algunos enunciados.
 * - La cotización es un calculo sin persistencia: `POST /api/v1/pedidos/cotizar`.
 * - El alta del pedido es `POST /api/v1/pedidos`.
 * - El historial es `GET /api/v1/pedidos/usuario/:usuario_id` y responde un ARRAY
 *   plano (sin envoltorio), ya ordenado por `fecha_creacion` descendente.
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
   * Id del dueño del pedido, tomado del claim `usuario_id` del JWT. El backend solo
   * lo persiste si llega en el body: sin el, el pedido queda con usuario_id NULL y
   * nunca aparece en `GET /pedidos/usuario/:id`.
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

/** Estados que maneja el backend (`ESTADOS_VALIDOS` en `app/pedidos.py`). */
export type EstadoPedido = 'PENDIENTE' | 'EN_CAMINO' | 'ENTREGADO' | 'RECHAZADO'

/** Fila completa tal como la serializa `Pedido.to_dict()` en el backend. */
export interface Pedido {
  id: number
  usuario_id: number | null
  cliente: string | null
  direccion: string | null
  lat_origen: number
  lon_origen: number
  lat_destino: number
  lon_destino: number
  peso_kg: number
  categoria: string | null
  es_fragil: boolean
  es_urgente: boolean
  costo_total: number | null
  /** Formato YYYY-MM-DD (viene del input date del formulario). */
  fecha_programada: string | null
  /** string por si el backend suma estados nuevos sin avisar al frontend. */
  estado: EstadoPedido | string
  /** ISO 8601 en UTC, pero SIN zona horaria (el backend usa utcnow()). */
  fecha_creacion: string | null
}

/** Historial del cliente autenticado. */
export async function obtenerPedidosUsuario(usuarioId: number): Promise<Pedido[]> {
  const datos = await peticion<unknown>(`/api/v1/pedidos/usuario/${usuarioId}`)

  if (Array.isArray(datos)) return datos as Pedido[]

  // Defensa ante un futuro envoltorio { pedidos: [...] }.
  const envuelto = (datos as { pedidos?: unknown } | null)?.pedidos
  return Array.isArray(envuelto) ? (envuelto as Pedido[]) : []
}
