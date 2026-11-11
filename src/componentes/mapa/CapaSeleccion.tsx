import { useMap, useMapEvents } from 'react-leaflet'

import { encuadrarPuntos } from './encuadre'
import type { Punto } from './geometria'

/**
 * Capa interna del mapa: traduce los clics en coordenadas y reajusta la vista
 * para que ambos puntos queden visibles. Se monta dentro de `MapContainer`
 * porque `useMap` y `useMapEvents` dependen de ese contexto.
 *
 * El reajuste ocurre solo tras un clic, nunca al terminar un arrastre: si
 * recentramos en el `dragend` la vista salta bajo el dedo del usuario y parece
 * un fallo de la aplicacion.
 */
export function CapaSeleccion({
  alSeleccionar,
}: {
  /** Coloca el punto y devuelve el par origen/destino ya actualizado. */
  alSeleccionar: (punto: Punto) => { origen: Punto | null; destino: Punto | null }
}) {
  const mapa = useMap()

  useMapEvents({
    click(evento) {
      const siguiente = alSeleccionar({
        latitud: evento.latlng.lat,
        longitud: evento.latlng.lng,
      })
      encuadrarPuntos(mapa, [siguiente.origen, siguiente.destino], mapa.getZoom())
    },
  })

  return null
}
