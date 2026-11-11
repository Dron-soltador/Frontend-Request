import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

import { encuadrarPuntos } from './encuadre'
import type { Punto } from './geometria'

/**
 * Reajusta la vista cuando los puntos cambian sin que el usuario toque el mapa:
 * al elegir una direccion buscada o al recuperar un borrador guardado. Sin esto
 * el marcador se dibuja fuera del encuadre y el cliente no ve donde quedo.
 */
export function EncuadrePorRevision({
  origen,
  destino,
  revision,
}: {
  origen: Punto | null
  destino: Punto | null
  revision: number
}) {
  const mapa = useMap()

  useEffect(() => {
    if (revision === 0) return
    encuadrarPuntos(mapa, [origen, destino], 15)
    // Solo reacciona a `revision`: las coordenadas llegan en el mismo cambio y
    // reencuadrar en cada render moveria el mapa sin que nada lo justifique.
  }, [revision, mapa, origen, destino])

  return null
}
