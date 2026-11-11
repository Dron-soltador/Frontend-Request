import type { BorradorPedido } from '../../state/borrador'
import { tiempoRelativo } from '../../state/borrador'
import { IconoEstado, IconoGuardar } from './IconosPedido'

interface Props {
  borrador: BorradorPedido | null
  sinGuardar: boolean
  completo: boolean
  onGuardar: () => void
  onDescartar: () => void
}

/** Franja de estado del borrador: incompleto, con cambios o guardado. */
export function EstadoBorrador({
  borrador,
  sinGuardar,
  completo,
  onGuardar,
  onDescartar,
}: Props) {
  const hayBorrador = borrador !== null

  return (
    <section
      className={`rounded-xl border p-4 sm:p-5 ${
        !completo
          ? 'border-slate-200 bg-white'
          : sinGuardar
            ? 'border-amber-300 bg-amber-50'
            : 'border-emerald-300 bg-emerald-50'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <IconoEstado sinGuardar={sinGuardar} />
            {!completo
              ? 'Pedido incompleto'
              : sinGuardar
                ? 'Cambios sin guardar'
                : 'Pedido guardado en tu sesion'}
          </h2>
          <p className="mt-1 text-xs text-slate-600">
            {!completo
              ? 'Falta definir el origen o el destino.'
              : sinGuardar
                ? 'Los puntos ya no coinciden con el borrador guardado.'
                : `Borrador guardado ${tiempoRelativo(borrador!.guardadoEn)}. Se conserva al salir de esta seccion.`}
          </p>
        </div>

        <div className="flex shrink-0 gap-2">
          {hayBorrador && (
            <button
              type="button"
              onClick={onDescartar}
              className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Descartar
            </button>
          )}
          <button
            type="button"
            onClick={onGuardar}
            disabled={!completo || !sinGuardar}
            className="inline-flex items-center gap-2 rounded-lg bg-marca-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-marca-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <IconoGuardar />
            Guardar pedido
          </button>
        </div>
      </div>
    </section>
  )
}
