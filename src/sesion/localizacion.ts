import type { Punto } from '../componentes/mapa/geometria'

/**
 * Direcciones que el cliente reutiliza entre envios ("Casa", "Oficina", "Deposito").
 *
 * Es distinto del borrador del pedido (`sesion/borrador.ts`): aqui viven
 * direcciones reutilizables a largo plazo, no los datos de un pedido en curso.
 * Ninguno de los dos toca el microservicio; el guardado definitivo en PostgreSQL
 * corresponde al alta del pedido, que es la issue del formulario de solicitud.
 */

const CLAVE_GUARDADOS = 'dronedesde.ubicacion.guardadas'

/** Punto del mapa junto a la direccion legible que lo describe. */
export interface PuntoEtiquetado {
  punto: Punto
  direccion: string
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