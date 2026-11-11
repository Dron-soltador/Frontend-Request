import { formatearDia } from './fechas'
import { TablaPedidos } from './TablaPedidos'
import type { Pedido } from '../../services/pedidos'

interface Props {
  pedidos: Pedido[]
  diaSeleccionado: string | null
  onLimpiarFiltro: () => void
}

/** Panel del historial: titulo segun el filtro activo y tabla de pedidos. */
export function PanelHistorial({ pedidos, diaSeleccionado, onLimpiarFiltro }: Props) {
  return (
    <section
      className="rounded-xl border border-slate-200 bg-white shadow-sm"
      aria-labelledby="titulo-historial"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-5 py-3.5">
        <div>
          <h2 id="titulo-historial" className="text-sm font-semibold text-slate-900">
            {diaSeleccionado ? `Envios del ${formatearDia(diaSeleccionado)}` : 'Historial de envios'}
          </h2>
          <p className="text-xs text-slate-500">
            {diaSeleccionado
              ? 'Filtrado por fecha de entrega programada.'
              : 'Del mas reciente al mas antiguo.'}
          </p>
        </div>
        {diaSeleccionado && (
          <button
            type="button"
            onClick={onLimpiarFiltro}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Ver todos
          </button>
        )}
      </div>

      <TablaPedidos pedidos={pedidos} hayFiltro={diaSeleccionado !== null} />
    </section>
  )
}
