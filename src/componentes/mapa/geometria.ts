/** Tipos y utilidades geoespaciales compartidos por el selector de puntos. */

export interface Punto {
  latitud: number
  longitud: number
}

/**
 * Mismo radio terrestre y misma formula de Haversine que `app/cotizador.py`
 * del microservicio de Pedidos. Si el backend recalcula la cotizacion, la
 * distancia que ve el cliente antes de confirmar coincide con la que cobrara.
 */
const RADIO_TIERRA_KM = 6371.0

export function distanciaHaversineKm(puntoA: Punto, puntoB: Punto): number {
  const latA = (puntoA.latitud * Math.PI) / 180
  const latB = (puntoB.latitud * Math.PI) / 180
  const deltaLat = ((puntoB.latitud - puntoA.latitud) * Math.PI) / 180
  const deltaLon = ((puntoB.longitud - puntoA.longitud) * Math.PI) / 180

  const h =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(latA) * Math.cos(latB) * Math.sin(deltaLon / 2) ** 2

  return 2 * RADIO_TIERRA_KM * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

/**
 * Redondea a 6 decimales (~11 cm) para no mandar al backend una precisión que
 * ningun dronGPS necesita y que solo infla el payload.
 */
export function normalizarPunto(punto: Punto): Punto {
  return {
    latitud: Math.round(punto.latitud * 1e6) / 1e6,
    longitud: Math.round(punto.longitud * 1e6) / 1e6,
  }
}

/** Los mismos limites que valida `_validar_coordenadas` en el backend. */
export function esPuntoValido(punto: Punto | null): punto is Punto {
  if (!punto) return false
  if (!Number.isFinite(punto.latitud) || !Number.isFinite(punto.longitud)) return false
  return punto.latitud >= -90 && punto.latitud <= 90 && punto.longitud >= -180 && punto.longitud <= 180
}

export function formatearCoordenada(valor: number): string {
  return valor.toFixed(6)
}