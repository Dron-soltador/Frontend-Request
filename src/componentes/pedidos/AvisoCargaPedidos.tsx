import { Spinner } from '../ui/Spinner'

interface Props {
  cargando: boolean
  mensajeError?: string
  onReintentar: () => void
}

/** Estado de carga o error del historial de pedidos. */
export function AvisoCargaPedidos({ cargando, mensajeError, onReintentar }: Props) {
  if (cargando) {
    return (
      <div
        role="status"
        className="flex items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white px-5 py-12 text-sm text-slate-600 shadow-sm"
      >
        <Spinner className="size-5 text-marca-600" />
        Cargando tus pedidos...
      </div>
    )
  }

  if (!mensajeError) return null

  return (
    <div
      role="alert"
      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-900"
    >
      <span>{mensajeError}</span>
      <button
        type="button"
        onClick={onReintentar}
        className="rounded-lg border border-red-300 bg-white px-3.5 py-1.5 font-semibold text-red-800 transition hover:bg-red-100"
      >
        Reintentar
      </button>
    </div>
  )
}
