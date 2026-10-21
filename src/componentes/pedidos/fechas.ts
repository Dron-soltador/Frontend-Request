import type { Pedido } from '../../servicios/pedidos'

/**
 * Utilidades de fecha para "Mis pedidos".
 *
 * Dos trampas que evitan estas funciones:
 *  - `fecha_programada` llega como "YYYY-MM-DD". `new Date("2026-10-16")` lo trata
 *    como UTC y en Argentina (UTC-3) mostraria el 15. Se arma con componentes locales.
 *  - `fecha_creacion` llega sin zona horaria aunque sea UTC (el backend usa
 *    `datetime.utcnow().isoformat()`), y JS lo interpretaria como hora local.
 */

export function claveDia(anio: number, mes: number, dia: number): string {
  return `${anio}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
}

export function claveDeHoy(): string {
  const hoy = new Date()
  return claveDia(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
}

/** Devuelve "YYYY-MM-DD" o null si el valor no trae una fecha valida. */
export function diaProgramado(pedido: Pick<Pedido, 'fecha_programada'>): string | null {
  const coincidencia = /^(\d{4})-(\d{2})-(\d{2})/.exec(pedido.fecha_programada ?? '')
  return coincidencia ? `${coincidencia[1]}-${coincidencia[2]}-${coincidencia[3]}` : null
}

export function fechaCreacion(valor: string | null): Date | null {
  if (!valor) return null
  const tieneZona = /(Z|[+-]\d{2}:?\d{2})$/.test(valor)
  const fecha = new Date(tieneZona ? valor : `${valor}Z`)
  return Number.isNaN(fecha.getTime()) ? null : fecha
}

export function formatearDia(clave: string): string {
  const [anio, mes, dia] = clave.split('-').map(Number)
  return new Date(anio, mes - 1, dia).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatearFechaHora(valor: string | null): string {
  const fecha = fechaCreacion(valor)
  if (!fecha) return '—'
  return fecha.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

/** Orden cronologico inverso: el envio mas reciente primero (desempata por id). */
export function ordenarRecientesPrimero(pedidos: Pedido[]): Pedido[] {
  return [...pedidos].sort((a, b) => {
    const ta = fechaCreacion(a.fecha_creacion)?.getTime() ?? 0
    const tb = fechaCreacion(b.fecha_creacion)?.getTime() ?? 0
    return tb - ta || b.id - a.id
  })
}

/** Agrupa por dia de entrega programada. Los pedidos sin fecha valida se omiten. */
export function agruparPorDia(pedidos: Pedido[]): Map<string, Pedido[]> {
  const grupos = new Map<string, Pedido[]>()
  for (const pedido of pedidos) {
    const dia = diaProgramado(pedido)
    if (!dia) continue
    const lista = grupos.get(dia)
    if (lista) lista.push(pedido)
    else grupos.set(dia, [pedido])
  }
  return grupos
}
