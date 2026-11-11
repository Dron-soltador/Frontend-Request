/** Overlays del mapa: carga inicial de teselas y error de red. */

export function CargandoTeselas() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="absolute inset-0 z-[500] flex flex-col items-center justify-center gap-3 bg-slate-100"
    >
      <svg viewBox="0 0 24 24" fill="none" className="size-7 animate-spin text-marca-600">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.2" />
        <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <p className="text-sm font-medium text-slate-600">Cargando el mapa...</p>
    </div>
  )
}

export function AvisoTeselas({ mensaje }: { mensaje: string }) {
  return (
    <div className="absolute inset-0 z-[500] flex items-center justify-center bg-slate-100 px-6">
      <div className="max-w-sm rounded-xl border border-amber-300 bg-amber-50 p-4 text-center">
        <p className="text-sm font-medium text-amber-900">{mensaje}</p>
        <p className="mt-1 text-xs text-amber-800">
          Puedes fijar el origen y el destino escribiendo las coordenadas a mano.
        </p>
      </div>
    </div>
  )
}
