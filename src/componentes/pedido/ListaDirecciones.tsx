import { formatearCoordenada } from '../mapa/geometria'
import type { DireccionGuardada } from '../../state/localizacion'

interface Props {
  guardadas: DireccionGuardada[]
  nombre: string
  onNombreChange: (valor: string) => void
  hayPunto: boolean
  destinoActivo: 'origen' | 'destino'
  onGuardar: () => void
  onUsar: (item: DireccionGuardada) => void
  onBorrar: (id: string) => void
}

/** Agenda de direcciones habituales reutilizables en futuros envios. */
export function ListaDirecciones({
  guardadas,
  nombre,
  onNombreChange,
  hayPunto,
  destinoActivo,
  onGuardar,
  onUsar,
  onBorrar,
}: Props) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-3.5">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Mis direcciones guardadas</h2>
          <p className="text-xs text-slate-500">Direcciones que reutilizas en futuros envios.</p>
        </div>

        <form
          onSubmit={(evento) => {
            evento.preventDefault()
            onGuardar()
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={nombre}
            onChange={(evento) => onNombreChange(evento.target.value)}
            placeholder="Ej: Casa, Oficina"
            aria-label="Nombre de la direccion a guardar"
            maxLength={40}
            className="campo-input w-40 py-1.5 text-sm"
          />
          <button
            type="submit"
            disabled={!hayPunto || !nombre.trim()}
            className="rounded-lg border border-marca-600 px-3.5 py-1.5 text-sm font-semibold text-marca-700 transition hover:bg-marca-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Guardar {destinoActivo === 'origen' ? 'origen' : 'destino'}
          </button>
        </form>
      </div>

      {guardadas.length === 0 ? (
        <p className="px-5 py-6 text-sm text-slate-500">
          Todavia no guardaste ninguna direccion. Fija un punto y dale un nombre.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {guardadas.map((item) => (
            <li key={item.id} className="flex items-center gap-3 px-5 py-3">
              <button type="button" onClick={() => onUsar(item)} className="min-w-0 flex-1 text-left">
                <span className="block text-sm font-medium text-marca-800">{item.nombre}</span>
                <span className="block truncate text-xs text-slate-500">
                  {item.direccion ||
                    `${formatearCoordenada(item.punto.latitud)}, ${formatearCoordenada(item.punto.longitud)}`}
                </span>
              </button>

              <span className="hidden shrink-0 font-mono text-[11px] text-slate-400 sm:inline">
                {formatearCoordenada(item.punto.latitud)}, {formatearCoordenada(item.punto.longitud)}
              </span>

              <button
                type="button"
                onClick={() => onBorrar(item.id)}
                aria-label={`Eliminar ${item.nombre}`}
                className="shrink-0 rounded p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="size-4"
                >
                  <path d="M6 18 18 6M6 6l12 12" strokeLinecap="round" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
