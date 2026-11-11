import type { EstadoCotizacion } from '../../hooks/useCotizacion'
import { FormularioPaquete } from '../paquete/FormularioPaquete'
import type { DatosPaquete } from '../paquete/modeloPaquete'
import { PanelCotizacion } from '../paquete/PanelCotizacion'

interface Props {
  datos: DatosPaquete
  onChange: <K extends keyof DatosPaquete>(campo: K, valor: DatosPaquete[K]) => void
  errores: Partial<Record<keyof DatosPaquete, string>>
  deshabilitado: boolean
  onEnviar: () => void
  puedeEnviar: boolean
  cotizacion: EstadoCotizacion
}

/** Paso 2: datos del paquete a la izquierda y tarifa en vivo a la derecha. */
export function SeccionPaquete({
  datos,
  onChange,
  errores,
  deshabilitado,
  onEnviar,
  puedeEnviar,
  cotizacion,
}: Props) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-slate-900">Datos del paquete</h2>
      <p className="mt-0.5 text-sm text-slate-600">
        Al cambiar el peso, la categoria o la urgencia se recalcula la tarifa.
      </p>

      <div className="mt-5 grid gap-6 lg:grid-cols-2">
        <FormularioPaquete
          datos={datos}
          onChange={onChange}
          errores={errores}
          deshabilitado={deshabilitado}
          onEnviar={onEnviar}
          puedeEnviar={puedeEnviar}
        />
        <PanelCotizacion estado={cotizacion} />
      </div>
    </section>
  )
}
