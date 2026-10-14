import type { Punto } from '../componentes/mapa/geometria'

/**
 * Persistencia local de la localisation del cliente.
 *
 * No toca el microservicio: el alta del pedido (y con ella el guardado en
 * PostgreSQL) corresponde a la issue del formulario de solicitud. Aqui solo se
 * conserva en el navegador lo que el usuario ya eligio, para no perderlo al
 * recargar y para reutilizar sus direcciones habituales entre envios.
 */

const CLAVE_SELECCION = 'dronedesde.ubicacion.actual'
const CLAVE_GUARDADOS = 'dronedesde.ubicacion.guardadas'

/** Punto del mapa junto a la direccion legible que lo describes. */
export interface PuntoEtiquetado {
  punto: Punto
  direccion: string
}

export type Seleccion = {
  origen: PuntoEtiquetado | null
  destino: PuntoEtiquetado | null
}

export interface DireccionGuardada extends PuntoEtiquetado {
  id: string
  nombre: string
  creadoEn: string
}

function leer<T>(clave: string, porDefecto: T): T {
  try {
    const crudo = localStorage.getItem(clave)
    return crudo ? (JSON.parse(crudo) as T) : porDefecto
  } catch {
    // Un JSON corrupto no debe romper la pantalla: se descarta y se sigue.
    return porDefecto
  }
}

function escribir(clave: string, valor: unknown): void {
  try {
    localStorage.setItem(clave, JSON.stringify(valor))
  } catch {
    // Modo privado o cuota llena: la app sigue funcionando sin persistencia.
  }
}

export function leerSeleccion(): Seleccion {
  const datos = leer<Seleccion>(CLAVE_SELECCION, { origen: null, destino: null })
  return { origen: datos.origen ?? null, destino: datos.destino ?? null }
}

export function guardarSeleccion(seleccion: Seleccion): void {
  escribir(CLAVE_SELECCION, seleccion)
}

export function listarGuardadas(): DireccionGuardada[] {
  const datos = leer<DireccionGuardada[]>(CLAVE_GUARDADOS, [])
  return Array.isArray(datos) ? datos : []
}

/**
 * Guarda una direccion con el nombre que le da el cliente.
 * Si el nombre ya existe se actualiza en lugar de duplicarla.
 */
export function guardarDireccion(nombre: string, punto: Punto, direccion: string): DireccionGuardada {
  const existentes = listarGuardadas()
  const limpio = nombre.trim()

  const previa = existentes.find((item) => item.nombre.toLowerCase() === limpio.toLowerCase())
  const registro: DireccionGuardada = previa
    ? { ...previa, punto, direccion }
    : {
        id: crypto.randomUUID(),
        nombre: limpio,
        punto,
        direccion,
        creadoEn: new Date().toISOString(),
      }

  const actualizada = previa
    ? existentes.map((item) => (item.id === previa.id ? registro : item))
    : [registro, ...existentes]

  escribir(CLAVE_GUARDADOS, actualizada)
  return registro
}

export function eliminarDireccion(id: string): void {
  escribir(
    CLAVE_GUARDADOS,
    listarGuardadas().filter((item) => item.id !== id),
  )
}

export function limpiarSeleccion(): void {
  localStorage.removeItem(CLAVE_SELECCION)
}