import type { Sugerencia } from '../../services/geocodificacion'

interface Props {
  id: string
  etiqueta: string
  sugerencias: Sugerencia[]
  indiceActivo: number
  onResaltar: (indice: number) => void
  onElegir: (sugerencia: Sugerencia) => void
}

/** Desplegable accesible con las coincidencias de OpenStreetMap. */
export function ListaSugerencias({
  id,
  etiqueta,
  sugerencias,
  indiceActivo,
  onResaltar,
  onElegir,
}: Props) {
  return (
    <ul
      id={id}
      role="listbox"
      aria-label={`Sugerencias para ${etiqueta}`}
      className="animacion-entrada absolute inset-x-0 top-full z-[700] mt-1 max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-xl"
    >
      {sugerencias.map((sugerencia, indice) => (
        <li key={sugerencia.id} role="none">
          <button
            type="button"
            id={`${id}-opcion-${indice}`}
            role="option"
            aria-selected={indice === indiceActivo}
            onMouseEnter={() => onResaltar(indice)}
            onClick={() => onElegir(sugerencia)}
            className={`flex w-full items-start gap-2.5 px-3.5 py-2.5 text-left transition ${
              indice === indiceActivo ? 'bg-marca-50' : 'hover:bg-slate-50'
            }`}
          >
            <PuntoUbicacion />
            <span className="min-w-0">
              <span className="block text-sm leading-snug text-slate-800">
                {sugerencia.direccion}
              </span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}

function PuntoUbicacion() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={1.8}
      stroke="currentColor"
      className="mt-0.5 size-4 shrink-0 text-marca-600"
    >
      <path
        d="M12 21s7-5.686 7-11a7 7 0 1 0-14 0c0 5.314 7 11 7 11Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  )
}
