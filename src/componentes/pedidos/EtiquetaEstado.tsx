/**
 * Colores acordados en el README del proyecto (feedback visual):
 * verde = entregado, amarillo = en camino, rojo = rechazado. PENDIENTE usa azul
 * para distinguirse de "en camino" sin sugerir exito ni error.
 */
const ESTILOS: Record<string, { etiqueta: string; clases: string; punto: string }> = {
  PENDIENTE: { etiqueta: 'Pendiente', clases: 'bg-sky-100 text-sky-800 ring-sky-200', punto: 'bg-sky-500' },
  EN_CAMINO: { etiqueta: 'En camino', clases: 'bg-amber-100 text-amber-900 ring-amber-200', punto: 'bg-amber-500' },
  ENTREGADO: { etiqueta: 'Entregado', clases: 'bg-emerald-100 text-emerald-800 ring-emerald-200', punto: 'bg-emerald-500' },
  RECHAZADO: { etiqueta: 'Rechazado', clases: 'bg-red-100 text-red-800 ring-red-200', punto: 'bg-red-500' },
}

const ESTILO_DESCONOCIDO = {
  etiqueta: '',
  clases: 'bg-slate-100 text-slate-700 ring-slate-200',
  punto: 'bg-slate-400',
}

export function estiloEstado(estado: string | undefined | null) {
  if (!estado) {
    // Default: pending until admin modifies it via PUT /:id/estado
    return ESTILOS.PENDIENTE
  }
  const estilo = ESTILOS[estado]
  return estilo ?? { ...ESTILO_DESCONOCIDO, etiqueta: estado }
}

export const ESTADOS_ORDENADOS = ['PENDIENTE', 'EN_CAMINO', 'ENTREGADO', 'RECHAZADO'] as const

export function EtiquetaEstado({ estado }: { estado: string | undefined | null }) {
  const { etiqueta, clases, punto } = estiloEstado(estado)
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${clases}`}
    >
      <span aria-hidden="true" className={`size-1.5 rounded-full ${punto}`} />
      {etiqueta}
    </span>
  )
}
