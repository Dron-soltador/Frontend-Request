import { useMemo, useState } from 'react'

import type { Pedido } from '../../servicios/pedidos'
import { ESTADOS_ORDENADOS, estiloEstado } from './EtiquetaEstado'
import { agruparPorDia, claveDeHoy, claveDia } from './fechas'

const DIAS_SEMANA = ['L', 'M', 'M', 'J', 'V', 'S', 'D'] as const
const MAX_PUNTOS = 3

interface Props {
  pedidos: Pedido[]
  diaSeleccionado: string | null
  onSeleccionar: (dia: string | null) => void
}

/**
 * Agenda mensual. Cada dia con envios programados muestra un punto por estado
 * (con el color de la etiqueta) y un contador. Un clic filtra la tabla por ese dia.
 */
export function CalendarioPedidos({ pedidos, diaSeleccionado, onSeleccionar }: Props) {
  const hoy = claveDeHoy()
  const [vista, setVista] = useState(() => {
    const ahora = new Date()
    return { anio: ahora.getFullYear(), mes: ahora.getMonth() }
  })

  const porDia = useMemo(() => agruparPorDia(pedidos), [pedidos])

  const { anio, mes } = vista
  const diasDelMes = new Date(anio, mes + 1, 0).getDate()
  // getDay(): 0 = domingo. La semana argentina empieza el lunes.
  const huecosIniciales = (new Date(anio, mes, 1).getDay() + 6) % 7
  const titulo = new Date(anio, mes, 1).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })

  const prefijoMes = claveDia(anio, mes, 1).slice(0, 7)
  const enviosDelMes = [...porDia.entries()]
    .filter(([clave]) => clave.startsWith(prefijoMes))
    .reduce((total, [, lista]) => total + lista.length, 0)

  function moverMes(delta: number) {
    const destino = new Date(anio, mes + delta, 1)
    setVista({ anio: destino.getFullYear(), mes: destino.getMonth() })
  }

  function irAHoy() {
    const ahora = new Date()
    setVista({ anio: ahora.getFullYear(), mes: ahora.getMonth() })
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="titulo-calendario">
      <div className="flex items-center justify-between gap-2">
        <h2 id="titulo-calendario" className="text-sm font-semibold text-slate-900 capitalize">
          {titulo}
        </h2>
        <div className="flex items-center gap-1">
          <BotonNav etiqueta="Mes anterior" onClick={() => moverMes(-1)} trazo="m15 6-6 6 6 6" />
          <button
            type="button"
            onClick={irAHoy}
            className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-marca-700 transition hover:bg-marca-50"
          >
            Hoy
          </button>
          <BotonNav etiqueta="Mes siguiente" onClick={() => moverMes(1)} trazo="m9 6 6 6-6 6" />
        </div>
      </div>

      <p className="mt-1 text-xs text-slate-500">
        {enviosDelMes === 0
          ? 'Sin envios programados este mes.'
          : `${enviosDelMes} ${enviosDelMes === 1 ? 'envio programado' : 'envios programados'} este mes.`}
      </p>

      <div className="mt-4 grid grid-cols-7 gap-1 text-center">
        {DIAS_SEMANA.map((letra, indice) => (
          <div key={indice} className="py-1 text-[11px] font-semibold text-slate-400">
            {letra}
          </div>
        ))}

        {Array.from({ length: huecosIniciales }, (_, i) => (
          <div key={`hueco-${i}`} aria-hidden="true" />
        ))}

        {Array.from({ length: diasDelMes }, (_, i) => {
          const numero = i + 1
          const clave = claveDia(anio, mes, numero)
          const envios = porDia.get(clave) ?? []
          const estados = ESTADOS_ORDENADOS.filter((e) => envios.some((p) => p.estado === e))
          const hayOtros = envios.some((p) => !ESTADOS_ORDENADOS.some((e) => e === p.estado))
          const seleccionado = clave === diaSeleccionado
          const esHoy = clave === hoy

          return (
            <button
              key={clave}
              type="button"
              aria-pressed={seleccionado}
              aria-label={`${numero} de ${titulo}${
                envios.length ? `, ${envios.length} ${envios.length === 1 ? 'envio' : 'envios'}` : ', sin envios'
              }`}
              onClick={() => onSeleccionar(seleccionado ? null : clave)}
              className={`relative flex aspect-square flex-col items-center justify-center rounded-lg text-sm transition ${
                seleccionado
                  ? 'bg-marca-600 font-semibold text-white'
                  : envios.length
                    ? 'bg-marca-50 font-semibold text-marca-900 hover:bg-marca-100'
                    : 'text-slate-700 hover:bg-slate-100'
              } ${esHoy && !seleccionado ? 'ring-2 ring-marca-500 ring-inset' : ''}`}
            >
              <span>{numero}</span>

              {envios.length > 0 && (
                <span className="mt-0.5 flex items-center gap-0.5" aria-hidden="true">
                  {[...estados.map((e) => estiloEstado(e).punto), ...(hayOtros ? ['bg-slate-400'] : [])]
                    .slice(0, MAX_PUNTOS)
                    .map((color, n) => (
                      <span
                        key={n}
                        className={`size-1.5 rounded-full ${color} ${seleccionado ? 'ring-1 ring-white' : ''}`}
                      />
                    ))}
                </span>
              )}

              {envios.length > 1 && (
                <span
                  aria-hidden="true"
                  className={`absolute top-0.5 right-0.5 min-w-4 rounded-full px-1 text-[10px] leading-4 font-bold ${
                    seleccionado ? 'bg-white text-marca-700' : 'bg-marca-600 text-white'
                  }`}
                >
                  {envios.length}
                </span>
              )}
            </button>
          )
        })}
      </div>

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
    </section>
  )
}

function BotonNav({ etiqueta, onClick, trazo }: { etiqueta: string; onClick: () => void; trazo: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={etiqueta}
      className="rounded-lg p-1.5 text-slate-600 transition hover:bg-slate-100"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" className="size-4">
        <path d={trazo} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}
