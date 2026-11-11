interface Props {
  urgente: boolean
  onCambiar: (urgente: boolean) => void
  deshabilitado: boolean
}

/** Casilla de envio urgente: aplica el recargo del 25% en la cotizacion. */
export function ToggleUrgencia({ urgente, onCambiar, deshabilitado }: Props) {
  return (
    <label
      className={`flex items-start gap-3 rounded-lg border p-3.5 transition ${
        urgente ? 'border-amber-400 bg-amber-50' : 'border-slate-300 bg-white hover:bg-slate-50'
      }`}
    >
      <input
        type="checkbox"
        checked={urgente}
        onChange={(evento) => onCambiar(evento.target.checked)}
        disabled={deshabilitado}
        className="mt-0.5 size-4 rounded border-slate-300 text-amber-600 focus:ring-amber-600/30"
      />
      <span>
        <span className="block text-sm font-medium text-slate-900">Envio urgente</span>
        <span className="block text-xs text-slate-500">
          Prioridad sobre los demas pedidos. Aplica un recargo del 25%.
        </span>
      </span>
    </label>
  )
}
