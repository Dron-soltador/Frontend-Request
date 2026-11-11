import { ESTADOS_ORDENADOS, estiloEstado } from './EtiquetaEstado'

/** Tarjetas con la cantidad de pedidos en cada estado. */
export function ResumenEstados({ conteo }: { conteo: Record<string, number> }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {ESTADOS_ORDENADOS.map((estado) => (
        <li
          key={estado}
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
        >
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span
              aria-hidden="true"
              className={`size-2 rounded-full ${estiloEstado(estado).punto}`}
            />
            {estiloEstado(estado).etiqueta}
          </div>
          <p className="mt-1 text-2xl font-bold text-slate-900">{conteo[estado] ?? 0}</p>
        </li>
      ))}
    </ul>
  )
}
