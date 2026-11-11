import L from 'leaflet'
import type { Map as LeafletMap } from 'leaflet'

import { esPuntoValido } from './geometria'
import type { Punto } from './geometria'

/**
 * Ajusta la vista para que los puntos indicados queden visibles. Con un solo
 * punto hace zoom sobre el; con dos, encuadra ambos. Los nulos se ignoran.
 */
export function encuadrarPuntos(
  mapa: LeafletMap,
  puntos: Array<Punto | null>,
  zoomUnico: number,
) {
  const validos = puntos.filter((punto): punto is Punto => esPuntoValido(punto))

  if (validos.length === 1) {
    mapa.setView([validos[0].latitud, validos[0].longitud], zoomUnico)
  } else if (validos.length === 2) {
    mapa.fitBounds(
      L.latLngBounds(
        validos.map((punto) => [punto.latitud, punto.longitud] as [number, number]),
      ),
      { padding: [56, 80], maxZoom: 16, animate: false },
    )
  }
}
