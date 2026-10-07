import { useCallback, useMemo, useRef, useState } from 'react'
import { MapContainer, Marker, Polyline, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import type { Map as LeafletMap } from 'leaflet'

import { distanciaHaversineKm, esPuntoValido, formatearCoordenada, normalizarPunto } from './geometria'
import type { Punto } from './geometria'
import { crearIconoPunto, ESTILO_TRAZADO } from './marcadores'

/** Centro inicial: Ciudad de Buenos Aires. Solo define el encuadre de partida. */
export const CENTRO_INICIAL: Punto = { latitud: -34.6037, longitud: -58.3816 }
const ZOOM_INICIAL = 13

export type PuntoActivo = 'origen' | 'destino'

export interface SelectorPuntosProps {
  origen: Punto | null
  destino: Punto | null
  onChange: (cambios: { origen?: Punto; destino?: Punto }) => void
  /** Punto que se coloca al hacer clic en el mapa. */
  activo: PuntoActivo
  onActivoChange: (activo: PuntoActivo) => void
  className?: string
}

/**
 * Convierte los clics del mapa en coordenadas. Se monta dentro de MapContainer
 * porque `useMapEvents` necesita el contexto del mapa.
 */
/**
 * Capa interna del mapa: traduce los clics en coordenadas y reajusta la vista
 * para que ambos puntos queden visibles. Se monta dentro de `MapContainer` porque
 * `useMap` y `useMapEvents` dependen de ese contexto.
 *
 * El reajuste ocurre solo tras un clic, nunca al terminar un arrastre: si
 * recentramos en el `dragend` la vista salta bajo el dedo del usuario y parece
 * un fallo de la aplicacion.
 */
function CapaSeleccion({
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

      const puntos = [siguiente.origen, siguiente.destino].filter(
        (punto): punto is Punto => esPuntoValido(punto),
      )

      if (puntos.length === 1) {
        mapa.setView([puntos[0].latitud, puntos[0].longitud], mapa.getZoom())
      } else if (puntos.length === 2) {
        mapa.fitBounds(
          L.latLngBounds(
            puntos.map((punto) => [punto.latitud, punto.longitud] as [number, number]),
          ),
          { padding: [56, 80], maxZoom: 16, animate: false },
        )
      }
    },
  })

  return null
}

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
  className = 'h-[26rem] sm:h-[32rem]',
}: SelectorPuntosProps) {
  const [cargandoInicial, setCargandoInicial] = useState(true)
  const [errorTeselas, setErrorTeselas] = useState(false)
  const pendientes = useRef(0)
  // Tras la primera carga nunca mas volvemos a tapar el mapa: al desplazar o
  // zoomear Leaflet pide teselas nuevas y un overlay a pantalla completa se
  // perceptiona como un fallo o un retraso, no como una mejora.
  const primeraCarga = useRef(true)

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

  /**
   * Cuenta las teselas en vuelo para quitar el overlay solo cuando la pantalla
   * esta completa. Sin esto el mapa aparece gris y salta al cargar.
   */
  const controlarTeselas = useCallback(
    (evento: 'loading' | 'load' | 'tileerror') => () => {
      if (evento === 'loading') {
        pendientes.current += 1
        return
      }
      if (evento === 'tileerror') {
        setErrorTeselas(true)
        setCargandoInicial(false)
        return
      }

      pendientes.current = Math.max(0, pendientes.current - 1)
      if (pendientes.current === 0 && primeraCarga.current) {
        primeraCarga.current = false
        setCargandoInicial(false)
      }
    },
    [],
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

        {esPuntoValido(origen) && (
          <Marker
            position={[origen.latitud, origen.longitud]}
            icon={iconoOrigen}
            draggable
            eventHandlers={{ dragend: manejarArrastre('origen') }}
            alt="Punto A (origen)"
          />
        )}

        {esPuntoValido(destino) && (
          <Marker
            position={[destino.latitud, destino.longitud]}
            icon={iconoDestino}
            draggable
            eventHandlers={{ dragend: manejarArrastre('destino') }}
            alt="Punto B (destino)"
          />
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
      </MapContainer>

      {cargandoInicial && !errorTeselas && <CargandoTeselas />}

      {errorTeselas && (
        <AvisoTeselas
          mensaje="No se pudieron cargar las imagenes del mapa. Revisa tu conexion a internet."
        />
      )}

      <BarraSuperior
        activo={activo}
        onActivoChange={onActivoChange}
        distanciaKm={distancia}
      />
    </div>
  )
}

function CargandoTeselas() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="absolute inset-0 z-[500] flex flex-col items-center justify-center gap-3 bg-slate-100"
    >
      <svg viewBox="0 0 24 24" fill="none" className="size-7 animate-spin text-marca-600">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.2" />
        <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <p className="text-sm font-medium text-slate-600">Cargando el mapa...</p>
    </div>
  )
}

function AvisoTeselas({ mensaje }: { mensaje: string }) {
  return (
    <div className="absolute inset-0 z-[500] flex items-center justify-center bg-slate-100 px-6">
      <div className="max-w-sm rounded-xl border border-amber-300 bg-amber-50 p-4 text-center">
        <p className="text-sm font-medium text-amber-900">{mensaje}</p>
        <p className="mt-1 text-xs text-amber-800">
          Puedes fijar el origen y el destino escribiendo las coordenadas a mano.
        </p>
      </div>
    </div>
  )
}

function BarraSuperior({
  activo,
  onActivoChange,
  distanciaKm,
}: {
  activo: PuntoActivo
  onActivoChange: (activo: PuntoActivo) => void
  distanciaKm: number | null
}) {
  return (
    <div className="absolute inset-x-0 top-0 z-[600] flex flex-wrap items-start justify-between gap-2 p-3">
      {/* ml-14 deja libre el control de zoom que Leaflet ancla arriba a la izquierda. */}
      <div
        role="group"
        aria-label="Punto que se coloca al hacer clic en el mapa"
        className="ml-14 flex flex-wrap rounded-lg bg-white/95 p-1 shadow-sm ring-1 ring-slate-900/10 backdrop-blur"
      >
        <BotonPunto
          etiqueta="Punto A (origen)"
          activo={activo === 'origen'}
          color="bg-emerald-600"
          texto="A"
          onClick={() => onActivoChange('origen')}
        />
        <BotonPunto
          etiqueta="Punto B (destino)"
          activo={activo === 'destino'}
          color="bg-red-600"
          texto="B"
          onClick={() => onActivoChange('destino')}
        />
      </div>

      {distanciaKm !== null && (
        <span className="mr-1 mt-1 rounded-lg bg-white/95 px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm ring-1 ring-slate-900/10 backdrop-blur">
          {distanciaKm.toFixed(2)} km de distancia
        </span>
      )}
    </div>
  )
}

function BotonPunto({
  etiqueta,
  activo,
  color,
  texto,
  onClick,
}: {
  etiqueta: string
  activo: boolean
  color: string
  texto: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activo}
      className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition ${
        activo ? `${color} text-white shadow-sm` : 'text-slate-700 hover:bg-slate-100'
      }`}
    >
      <span
        className={`flex size-5 items-center justify-center rounded-full text-xs font-bold text-white ${activo ? 'bg-white/25' : color}`}
      >
        {texto}
      </span>
      {etiqueta}
    </button>
  )
}

export { formatearCoordenada }
export type { LeafletMap }