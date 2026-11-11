import type { PuntoActivo } from './selectorTipos'

interface Props {
  activo: PuntoActivo
  onActivoChange: (activo: PuntoActivo) => void
  distanciaKm: number | null
}

/** Barra flotante con el punto activo y la distancia calculada entre A y B. */
export function BarraSuperiorMapa({ activo, onActivoChange, distanciaKm }: Props) {
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
