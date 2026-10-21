import { Link } from 'react-router-dom'

import type { Pedido } from '../../servicios/pedidos'
import { EtiquetaEstado } from './EtiquetaEstado'
import { diaProgramado, formatearDia, formatearFechaHora } from './fechas'

function formatearCosto(valor: number | null): string {
  return valor == null ? '—' : `$${valor.toLocaleString('es-AR')}`
}

/**
 * Tabla del historial. Muestra los pedidos en el orden recibido: la pagina ya los
 * entrega en cronologico inverso, asi la tabla no decide nada por su cuenta.
 */
export function TablaPedidos({ pedidos, hayFiltro }: { pedidos: Pedido[]; hayFiltro: boolean }) {
  if (pedidos.length === 0) {
    return (
      <div className="px-5 py-10 text-center">
        <p className="text-sm font-medium text-slate-700">
          {hayFiltro ? 'No hay envios programados para ese dia.' : 'Todavia no realizaste ningun pedido.'}
        </p>
        {!hayFiltro && (
          <Link
            to="/pedido"
            className="mt-3 inline-block text-sm font-semibold text-marca-700 underline-offset-4 hover:underline"
          >
            Hacer mi primer pedido
          </Link>
        )}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-176 text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th scope="col" className="px-5 py-3 font-semibold">N.º</th>
            <th scope="col" className="px-3 py-3 font-semibold">Solicitado</th>
            <th scope="col" className="px-3 py-3 font-semibold">Entrega programada</th>
            <th scope="col" className="px-3 py-3 font-semibold">Destino</th>
            <th scope="col" className="px-3 py-3 font-semibold">Paquete</th>
            <th scope="col" className="px-3 py-3 text-right font-semibold">Costo</th>
            <th scope="col" className="px-5 py-3 font-semibold">Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {pedidos.map((pedido) => {
            const dia = diaProgramado(pedido)
            return (
              <tr key={pedido.id} className="hover:bg-slate-50/70">
                <td className="px-5 py-3.5 font-mono font-semibold text-slate-900">#{pedido.id}</td>
                <td className="px-3 py-3.5 whitespace-nowrap text-slate-600">
                  {formatearFechaHora(pedido.fecha_creacion)}
                </td>
                <td className="px-3 py-3.5 whitespace-nowrap text-slate-700">
                  {dia ? formatearDia(dia) : '—'}
                </td>
                <td className="max-w-64 px-3 py-3.5 text-slate-700">
                  <span className="line-clamp-2" title={pedido.direccion ?? undefined}>
                    {pedido.direccion || 'Punto definido en el mapa'}
                  </span>
                </td>
                <td className="px-3 py-3.5 text-slate-700">
                  <span>{pedido.categoria || 'Estandar'}</span>
                  <span className="block text-xs text-slate-500">
                    {pedido.peso_kg} kg{pedido.es_urgente ? ' · Urgente' : ''}
                  </span>
                </td>
                <td className="px-3 py-3.5 text-right whitespace-nowrap text-slate-900">
                  {formatearCosto(pedido.costo_total)}
                </td>
                <td className="px-5 py-3.5">
                  <EtiquetaEstado estado={pedido.estado} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
