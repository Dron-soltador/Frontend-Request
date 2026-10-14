import type { Cotizacion } from '../../servicios/pedidos'
import type { EstadoCotizacion } from './useCotizacion'

/**
 * Panel de la tarifa. Muestra el desglose que devuelve el cotizador del
 * backend, de modo que el cliente ve de donde sale el precio y no solo el total.
 */
export function PanelCotizacion({ estado }: { estado: EstadoCotizacion }) {
  if (estado.estado === 'inactiva') {
    return (
      <aside className="rounded-xl border border-dashed border-slate-300 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">Tarifa estimada</h2>
        <p className="mt-2 text-sm text-slate-500">
          Define el origen, el destino y el peso para ver el costo de tu envio.
        </p>
      </aside>
    )
  }

  if (estado.estado === 'calculando') {
    return (
      <aside className="rounded-xl border border-slate-200 bg-white p-5" aria-busy="true">
        <h2 className="text-sm font-semibold text-slate-900">Tarifa estimada</h2>
        <div className="mt-4 space-y-2.5" aria-hidden="true">
          {[70, 50, 38].map((ancho, indice) => (
            <div
              key={ancho}
              className="h-3 animate-pulse rounded bg-slate-200"
              style={{ width: `${ancho}%`, animationDelay: `${indice * 120}ms` }}
            />
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-500" role="status">
          Calculando...
        </p>
      </aside>
    )
  }

  if (estado.estado === 'error') {
    return (
      <aside className="rounded-xl border border-red-200 bg-red-50 p-5">
        <h2 className="text-sm font-semibold text-red-900">No pudimos cotizar el envio</h2>
        <p className="mt-2 text-sm text-red-800">{estado.mensaje}</p>
        <p className="mt-1 text-xs text-red-700">
          Revisa el peso y los puntos del mapa. La cotizacion se reintenta sola al corregirlos.
        </p>
      </aside>
    )
  }

  return <Tarifa cotizacion={estado.cotizacion} />
}

function Tarifa({ cotizacion }: { cotizacion: Cotizacion }) {
  const { desglose } = cotizacion
  const moneda = (valor: number) =>
    valor.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })

  const lineas = [
    { etiqueta: 'Tarifa base', valor: desglose.tarifa_base },
    { etiqueta: 'Peso del paquete', valor: desglose.costo_peso },
    { etiqueta: `Distancia (${cotizacion.distancia_km} km)`, valor: desglose.costo_distancia },
  ].filter((linea) => linea.valor > 0)

  return (
    <aside className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-5">
      <h2 className="text-sm font-semibold text-slate-900">Tarifa estimada</h2>

      <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
        {moneda(cotizacion.costo_total)}
      </p>
      <p className="mt-1 text-xs text-slate-600">
        Distancia calculada: {cotizacion.distancia_km} km
      </p>

      <dl className="mt-4 space-y-1.5 border-t border-emerald-200 pt-3 text-sm">
        {lineas.map((linea) => (
          <div key={linea.etiqueta} className="flex justify-between gap-3">
            <dt className="text-slate-600">{linea.etiqueta}</dt>
            <dd className="font-medium text-slate-800">{moneda(linea.valor)}</dd>
          </div>
        ))}

        {desglose.recargo_fragil > 0 && (
          <Recargo
            etiqueta="Recargo por fragilidad (+15%)"
            valor={desglose.recargo_fragil}
            moneda={moneda}
          />
        )}
        {desglose.recargo_urgente > 0 && (
          <Recargo etiqueta="Recargo por urgencia (+25%)" valor={desglose.recargo_urgente} moneda={moneda} />
        )}
      </dl>
    </aside>
  )
}

function Recargo({
  etiqueta,
  valor,
  moneda,
}: {
  etiqueta: string
  valor: number
  moneda: (v: number) => string
}) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-amber-700">{etiqueta}</dt>
      <dd className="font-medium text-amber-800">+{moneda(valor)}</dd>
    </div>
  )
}