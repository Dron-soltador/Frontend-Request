import { useMemo, useState } from 'react'

import type { Pedido } from '../../services/pedidos'
import { BotonNavCalendario } from './BotonNavCalendario'
import { DiaCalendario } from './DiaCalendario'
import { agruparPorDia, claveDeHoy, claveDia } from './fechas'
import { LeyendaCalendario } from './LeyendaCalendario'

const DIAS_SEMANA = ['L', 'M', 'M', 'J', 'V', 'S', 'D'] as const

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
  const titulo = new Date(anio, mes, 1).toLocaleDateString('es-AR', {
    month: 'long',
    year: 'numeric',
  })
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
    <section
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
      aria-labelledby="titulo-calendario"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 id="titulo-calendario" className="text-sm font-semibold text-slate-900 capitalize">
          {titulo}
        </h2>
        <div className="flex items-center gap-1">
          <BotonNavCalendario etiqueta="Mes anterior" onClick={() => moverMes(-1)} trazo="m15 6-6 6 6 6" />
          <button
            type="button"
            onClick={irAHoy}
            className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-marca-700 transition hover:bg-marca-50"
          >
            Hoy
          </button>
          <BotonNavCalendario etiqueta="Mes siguiente" onClick={() => moverMes(1)} trazo="m9 6 6 6-6 6" />
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

        {Array.from({ length: huecosIniciales }, (_, indice) => (
          <div key={`hueco-${indice}`} aria-hidden="true" />
        ))}

        {Array.from({ length: diasDelMes }, (_, indice) => {
          const numero = indice + 1
          const clave = claveDia(anio, mes, numero)
          return (
            <DiaCalendario
              key={clave}
              numero={numero}
              clave={clave}
              titulo={titulo}
              envios={porDia.get(clave) ?? []}
              seleccionado={clave === diaSeleccionado}
              esHoy={clave === hoy}
              onSeleccionar={onSeleccionar}
            />
          )
        })}
      </div>

      <LeyendaCalendario />
    </section>
  )
}
