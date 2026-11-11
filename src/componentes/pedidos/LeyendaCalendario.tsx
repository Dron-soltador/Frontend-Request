import { ESTADOS_ORDENADOS, estiloEstado } from './EtiquetaEstado'

/** Leyenda de colores por estado, al pie de la agenda. */
export function LeyendaCalendario() {
  return (
    <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-slate-100 pt-3 text-xs text-slate-600">
      {ESTADOS_ORDENADOS.map((estado) => {
        const { etiqueta, punto } = estiloEstado(estado)
        return (
          <li key={estado} className="flex items-center gap-1.5">
            <span aria-hidden="true" className={`size-2 rounded-full ${punto}`} />
            {etiqueta}
          </li>
        )
      })}
    </ul>
  )
}
