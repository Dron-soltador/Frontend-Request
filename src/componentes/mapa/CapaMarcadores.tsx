import { Marker, Polyline, Tooltip } from 'react-leaflet'
import type { DivIcon } from 'leaflet'

import { esPuntoValido } from './geometria'
import type { Punto } from './geometria'
import { ESTILO_TRAZADO } from './marcadores'

type Arrastre = (
  punto: 'origen' | 'destino',
) => (evento: { target: { getLatLng: () => { lat: number; lng: number } } }) => void

interface Props {
  origen: Punto | null
  destino: Punto | null
  iconoOrigen: DivIcon
  iconoDestino: DivIcon
  direccionOrigen?: string
  direccionDestino?: string
  onArrastrar: Arrastre
}

/** Marcadores arrastrables A/B y la polilinea que los une. */
export function CapaMarcadores({
  origen,
  destino,
  iconoOrigen,
  iconoDestino,
  direccionOrigen,
  direccionDestino,
  onArrastrar,
}: Props) {
  return (
    <>
      {esPuntoValido(origen) && (
        <Marker
          position={[origen.latitud, origen.longitud]}
          icon={iconoOrigen}
          draggable
          eventHandlers={{ dragend: onArrastrar('origen') }}
          alt="Punto A (origen)"
        >
          {direccionOrigen && (
            <Tooltip direction="top" offset={[0, -32]}>
              <span className="line-clamp-2 max-w-56">{direccionOrigen}</span>
            </Tooltip>
          )}
        </Marker>
      )}

      {esPuntoValido(destino) && (
        <Marker
          position={[destino.latitud, destino.longitud]}
          icon={iconoDestino}
          draggable
          eventHandlers={{ dragend: onArrastrar('destino') }}
          alt="Punto B (destino)"
        >
          {direccionDestino && (
            <Tooltip direction="top" offset={[0, -32]}>
              <span className="line-clamp-2 max-w-56">{direccionDestino}</span>
            </Tooltip>
          )}
        </Marker>
      )}

      {esPuntoValido(origen) && esPuntoValido(destino) && (
        <Polyline
          positions={[
            [origen.latitud, origen.longitud],
            [destino.latitud, destino.longitud],
          ]}
          pathOptions={ESTILO_TRAZADO}
        />
      )}
    </>
  )
}
