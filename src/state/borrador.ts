import type { PuntoEtiquetado } from './localizacion'

/**
 * Borrador del pedido en curso.
 *
 * Es distinto de la localizacion guardada: aqui viven los datos que el cliente
 * esta por completar antes de presionar "Enviar pedido". El backend solo
 * aceptara el pedido completo (peso, categoria, urgencia), asi que hasta que esa
 * issue exista estos datos viven unicamente en la sesion del navegador. Si el
 * cliente cierra la pestana sin enviar, el borrador se pierde a proposito: no
 * dejamos pedidos a medias en la base de datos.
 */

const CLAVE = 'dronedesde.pedido.borrador'

export interface BorradorPedido {
  origen: PuntoEtiquetado | null
  destino: PuntoEtiquetado | null
  /** Momento del guardado, para poder avisar cuanto se guardo. */
  guardadoEn: string
}

function leer(): BorradorPedido | null {
  try {
    const crudo = localStorage.getItem(CLAVE)
    if (!crudo) return null

    const datos = JSON.parse(crudo) as Partial<BorradorPedido>
    if (!datos.guardadoEn) return null

    return { origen: datos.origen ?? null, destino: datos.destino ?? null, guardadoEn: datos.guardadoEn }
  } catch {
    return null
  }
}

/** Guarda el borrador y devuelve el registro persistido. */
export function guardarBorrador(
  origen: PuntoEtiquetado | null,
  destino: PuntoEtiquetado | null,
): BorradorPedido {
  const borrador: BorradorPedido = {
    origen,
    destino,
    guardadoEn: new Date().toISOString(),
  }
  try {
    localStorage.setItem(CLAVE, JSON.stringify(borrador))
  } catch {
    // Modo privado o cuota llena: la sesion sigue funcionando en memoria.
  }
  return borrador
}

export function leerBorrador(): BorradorPedido | null {
  return leer()
}

export function limpiarBorrador(): void {
  localStorage.removeItem(CLAVE)
}

/** ¿Los puntos actuales coinciden con lo guardado? Si no, hay cambios sin guardar. */
export function hayCambiosSinGuardar(
  borrador: BorradorPedido | null,
  origen: PuntoEtiquetado | null,
  destino: PuntoEtiquetado | null,
): boolean {
  if (!borrador) return true

  const iguales = (a: PuntoEtiquetado | null, b: PuntoEtiquetado | null) =>
    a?.punto.latitud === b?.punto.latitud &&
    a?.punto.longitud === b?.punto.longitud &&
    a?.direccion === b?.direccion

  return !iguales(borrador.origen, origen) || !iguales(borrador.destino, destino)
}

/** "hace 3 min" a partir de una fecha ISO, para la etiqueta del borrador. */
export function tiempoRelativo(iso: string): string {
  const segundos = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (segundos < 60) return 'hace instantes'
  if (segundos < 3600) return `hace ${Math.floor(segundos / 60)} min`
  if (segundos < 86400) return `hace ${Math.floor(segundos / 3600)} h`
  return `hace ${Math.floor(segundos / 86400)} d`
}
