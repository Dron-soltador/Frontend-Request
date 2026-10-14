import { ErrorApi } from './clienteHttp'
import type { Punto } from '../componentes/mapa/geometria'

/**
 * Geocodificacion con Nominatim, el buscador de OpenStreetMap. Se usa el mismo
 * proveedor que las teselas del mapa para no depender de una API de pago.
 *
 * Politica de uso de Nominatim (https://operations.osmfoundation.org/policies/nominatim/):
 * se permite como maximo 1 peticion por segundo. Por eso este modulo aplica tres
 * medidas: cache en memoria, debounce en la interfaz y un intervalo minimo entre
 * peticiones al servidor.
 */

const ENDPOINT = 'https://nominatim.openstreetmap.org/search'
const INTERVALO_MINIMO_MS = 1100
const CACHE_MAX = 50

export interface Sugerencia {
  id: string
  /** Texto que se muestra en la lista y se guarda como referencia del punto. */
  direccion: string
  punto: Punto
}

interface RespuestaNominatim {
  place_id?: number
  lat: string
  lon: string
  display_name: string
}

let cache = new Map<string, Sugerencia[]>()
let ultimaPeticion = 0

/** Serializa las peticiones para respetar el limite de 1 por segundo. */
function esperarTurno(): Promise<void> {
  const espera = Math.max(0, ultimaPeticion + INTERVALO_MINIMO_MS - Date.now())
  return espera === 0 ? Promise.resolve() : new Promise((resolve) => setTimeout(resolve, espera))
}

function normalizar(texto: string): string {
  return texto.trim().toLowerCase()
}

/**
 * Busca direcciones y devuelve sugerencias ordenadas por relevancia.
 * @param consulta Texto escrito por el usuario (minimo 3 caracteres).
 * @param senal Permite cancelar la peticion cuando el usuario sigue escribiendo.
 */
export async function buscarDirecciones(
  consulta: string,
  senal?: AbortSignal,
): Promise<Sugerencia[]> {
  const texto = consulta.trim()
  if (texto.length < 3) return []

  const clave = normalizar(texto)
  const cacheado = cache.get(clave)
  if (cacheado) return cacheado

  await esperarTurno()
  if (senal?.aborted) return []

  ultimaPeticion = Date.now()

  const parametros = new URLSearchParams({
    q: texto,
    format: 'jsonv2',
    limit: '6',
    addressdetails: '1',
    // Sin esto Nominatim devuelve coincidencias en cualquier pais y el ranking
    // termina proponiendo lugares homonimos lejos del usuario.
    countrycodes: 'ar',
  })

  let respuesta: Response
  try {
    respuesta = await fetch(`${ENDPOINT}?${parametros}`, { signal: senal })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return []
    throw new ErrorApi(
      'No se pudo consultar el buscador de direcciones. Revisa tu conexion a internet.',
      0,
    )
  }

  if (!respuesta.ok) {
    throw new ErrorApi('El buscador de direcciones fallo. Intenta de nuevo.', respuesta.status)
  }

  const datos = (await respuesta.json()) as RespuestaNominatim[]

  const sugerencias = datos.map((item) => ({
    id: String(item.place_id ?? item.display_name),
    direccion: item.display_name,
    punto: {
      latitud: Number(item.lat),
      longitud: Number(item.lon),
    },
  }))

  // Politica de uso: nunca crecer la cache sin limite.
  if (cache.size >= CACHE_MAX) cache = new Map([[clave, sugerencias]])
  else cache.set(clave, sugerencias)

  return sugerencias
}