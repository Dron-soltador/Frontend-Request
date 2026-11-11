import { useCallback, useMemo } from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'

import { useTeselasMapa } from '../../hooks/useTeselasMapa'
import { AvisoTeselas, CargandoTeselas } from './AvisosMapa'
import { BarraSuperiorMapa } from './BarraSuperiorMapa'
import { CapaMarcadores } from './CapaMarcadores'
import { CapaSeleccion } from './CapaSeleccion'
import { EncuadrePorRevision } from './EncuadrePorRevision'
import { distanciaHaversineKm, esPuntoValido, normalizarPunto } from './geometria'
import type { Punto } from './geometria'
import { crearIconoPunto } from './marcadores'
import { CENTRO_INICIAL, ZOOM_INICIAL } from './selectorTipos'
import type { SelectorPuntosProps } from './selectorTipos'

export { formatearCoordenada } from './geometria'
export { CENTRO_INICIAL } from './selectorTipos'
export type { PuntoActivo, SelectorPuntosProps } from './selectorTipos'
export type { Map as LeafletMap } from 'leaflet'

/**
 * Mapa 2D de OpenStreetMap para definir el Punto A (origen) y el Punto B
 * (destino). Los marcadores son arrastrables y hacer clic en cualquier punto
 * del mapa coloca el punto activo; ambos caminos actualizan las coordenadas
 * al instante, como pide el criterio de aceptacion.
 */
export function SelectorPuntos({
  origen,
  destino,
  onChange,
  activo,
  onActivoChange,
  direccionOrigen,
  direccionDestino,
  revisionEncuadre = 0,
  className = 'h-[26rem] sm:h-[32rem]',
}: SelectorPuntosProps) {
  const { cargandoInicial, errorTeselas, controlarTeselas } = useTeselasMapa()

  const iconoOrigen = useMemo(() => crearIconoPunto('A'), [])
  const iconoDestino = useMemo(() => crearIconoPunto('B'), [])

  const manejarClic = useCallback(
    (punto: Punto): { origen: Punto | null; destino: Punto | null } => {
      const normalizado = normalizarPunto(punto)

      if (activo === 'origen') {
        onChange({ origen: normalizado })
        return { origen: normalizado, destino }
      }

      onChange({ destino: normalizado })
      return { origen, destino: normalizado }
    },
    [activo, onChange, origen, destino],
  )

  const manejarArrastre = useCallback(
    (punto: 'origen' | 'destino') => (evento: { target: { getLatLng: () => { lat: number; lng: number } } }) => {
      const { lat, lng } = evento.target.getLatLng()
      const normalizado = normalizarPunto({ latitud: lat, longitud: lng })
      onChange({ [punto]: normalizado })
    },
    [onChange],
  )

  const distancia =
    esPuntoValido(origen) && esPuntoValido(destino)
      ? distanciaHaversineKm(origen, destino)
      : null

  return (
    <div className={`relative overflow-hidden rounded-xl ${className}`}>
      <MapContainer
        center={[CENTRO_INICIAL.latitud, CENTRO_INICIAL.longitud]}
        zoom={ZOOM_INICIAL}
        scrollWheelZoom
        className="h-full w-full"
        // Leaflet mide su contenedor para calcular el tamaño del mapa: sin alto
        // explicito la capa queda en 0 px y no se ve nada.
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
          eventHandlers={{
            loading: controlarTeselas('loading'),
            load: controlarTeselas('load'),
            tileerror: controlarTeselas('tileerror'),
          }}
        />

        <CapaSeleccion alSeleccionar={manejarClic} />
        <EncuadrePorRevision origen={origen} destino={destino} revision={revisionEncuadre} />
        <CapaMarcadores
          origen={origen}
          destino={destino}
          iconoOrigen={iconoOrigen}
          iconoDestino={iconoDestino}
          direccionOrigen={direccionOrigen}
          direccionDestino={direccionDestino}
          onArrastrar={manejarArrastre}
        />
      </MapContainer>

      {cargandoInicial && !errorTeselas && <CargandoTeselas />}

      {errorTeselas && (
        <AvisoTeselas mensaje="No se pudieron cargar las imagenes del mapa. Revisa tu conexion a internet." />
      )}

      <BarraSuperiorMapa activo={activo} onActivoChange={onActivoChange} distanciaKm={distancia} />
    </div>
  )
}
