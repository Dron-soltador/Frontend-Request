import type { Pedido } from '../../services/pedidos'
import { ESTADOS_ORDENADOS, estiloEstado } from './EtiquetaEstado'

const MAX_PUNTOS = 3

interface Props {
  numero: number
  clave: string
  titulo: string
  envios: Pedido[]
  seleccionado: boolean
  esHoy: boolean
  onSeleccionar: (clave: string | null) => void
}

/** Celda de un dia: numero, puntos por estado y contador de envios. */
export function DiaCalendario({
  numero,
  clave,
  titulo,
  envios,
  seleccionado,
  esHoy,
  onSeleccionar,
}: Props) {
  const estados = ESTADOS_ORDENADOS.filter((estado) =>
    envios.some((pedido) => pedido.estado === estado),
  )
  const hayOtros = envios.some(
    (pedido) => !ESTADOS_ORDENADOS.some((estado) => estado === pedido.estado),
  )
  const puntos = [
    ...estados.map((estado) => estiloEstado(estado).punto),
    ...(hayOtros ? ['bg-slate-400'] : []),
  ].slice(0, MAX_PUNTOS)

  return (
    <button
      type="button"
      aria-pressed={seleccionado}
      aria-label={`${numero} de ${titulo}${
        envios.length
          ? `, ${envios.length} ${envios.length === 1 ? 'envio' : 'envios'}`
          : ', sin envios'
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
          {puntos.map((color, indice) => (
            <span
              key={indice}
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
}
