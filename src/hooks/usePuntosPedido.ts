import { useCallback, useState } from 'react'

import type { Punto } from '../componentes/mapa/geometria'
import type { PuntoActivo } from '../componentes/mapa/selectorTipos'
import type { DireccionGuardada, PuntoEtiquetado } from '../state/localizacion'

interface Sugerencia {
  direccion: string
  punto: Punto
}

/**
 * Puntos A y B del envio, el punto activo y el contador que fuerza al mapa a
 * reencuadrar cuando los puntos cambian fuera de el (busqueda, borrador o
 * direccion guardada). Al mover un punto a mano se descarta su direccion: la
 * etiqueta dejaria de describir la coordenada real.
 */
export function usePuntosPedido() {
  const [origen, setOrigen] = useState<PuntoEtiquetado | null>(null)
  const [destino, setDestino] = useState<PuntoEtiquetado | null>(null)
  const [activo, setActivo] = useState<PuntoActivo>('origen')
  const [revisionEncuadre, setRevisionEncuadre] = useState(0)

  const reencuadrar = useCallback(() => setRevisionEncuadre((n) => n + 1), [])

  const aplicarCambios = useCallback((cambios: { origen?: Punto; destino?: Punto }) => {
    if (cambios.origen) setOrigen({ punto: cambios.origen, direccion: '' })
    if (cambios.destino) setDestino({ punto: cambios.destino, direccion: '' })
  }, [])

  const elegirSugerencia = useCallback(
    (clave: 'origen' | 'destino') => (sugerencia: Sugerencia) => {
      const seleccionado: PuntoEtiquetado = {
        punto: sugerencia.punto,
        direccion: sugerencia.direccion,
      }
      if (clave === 'origen') setOrigen(seleccionado)
      else setDestino(seleccionado)
      reencuadrar()
    },
    [reencuadrar],
  )

  const usarDireccion = useCallback(
    (item: DireccionGuardada) => {
      const seleccionado: PuntoEtiquetado = { punto: item.punto, direccion: item.direccion }
      if (activo === 'origen') setOrigen(seleccionado)
      else setDestino(seleccionado)
      reencuadrar()
    },
    [activo, reencuadrar],
  )

  const restaurar = useCallback(
    (nuevoOrigen: PuntoEtiquetado | null, nuevoDestino: PuntoEtiquetado | null) => {
      setOrigen(nuevoOrigen)
      setDestino(nuevoDestino)
      reencuadrar()
    },
    [reencuadrar],
  )

  const limpiar = useCallback(() => {
    setOrigen(null)
    setDestino(null)
    setActivo('origen')
    reencuadrar()
  }, [reencuadrar])

  return {
    origen,
    destino,
    activo,
    revisionEncuadre,
    setActivo,
    aplicarCambios,
    elegirSugerencia,
    usarDireccion,
    restaurar,
    limpiar,
  }
}
