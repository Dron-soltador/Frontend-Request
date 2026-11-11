import type { FormEvent } from 'react'

import { Campo } from '../formularios/Campo'
import { CategoriasPaquete } from './CategoriasPaquete'
import { hoy } from './modeloPaquete'
import type { DatosPaquete } from './modeloPaquete'
import { ToggleUrgencia } from './ToggleUrgencia'

export { CATEGORIAS, esFragil, PAQUETE_VACIO } from './modeloPaquete'
export type { DatosPaquete } from './modeloPaquete'

interface FormularioPaqueteProps {
  datos: DatosPaquete
  onChange: <K extends keyof DatosPaquete>(campo: K, valor: DatosPaquete[K]) => void
  errores: Partial<Record<keyof DatosPaquete, string>>
  deshabilitado: boolean
  onEnviar: () => void
  puedeEnviar: boolean
}

/**
 * Datos del paquete. Es el paso 2 del pedido: lo que el dron va a transportar.
 * Cada cambio en peso, categoria o urgencia dispara la cotizacion en vivo.
 */
export function FormularioPaquete({
  datos,
  onChange,
  errores,
  deshabilitado,
  onEnviar,
  puedeEnviar,
}: FormularioPaqueteProps) {
  function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    onEnviar()
  }

  return (
    <form onSubmit={manejarEnvio} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Campo
          etiqueta="Peso del paquete (kg)"
          type="number"
          name="peso_kg"
          inputMode="decimal"
          min={0.1}
          max={50}
          step={0.1}
          placeholder="2.5"
          ayuda="Entre 0.1 y 50 kg."
          value={datos.peso_kg || ''}
          onChange={(evento) => {
            const valor = Number.parseFloat(evento.target.value)
            onChange('peso_kg', Number.isFinite(valor) ? valor : 0)
          }}
          error={errores.peso_kg}
          disabled={deshabilitado}
          required
        />

        <Campo
          etiqueta="Fecha de entrega"
          type="date"
          name="fecha_programada"
          min={hoy()}
          value={datos.fecha_programada}
          onChange={(evento) => onChange('fecha_programada', evento.target.value)}
          error={errores.fecha_programada}
          disabled={deshabilitado}
          required
        />
      </div>

      <CategoriasPaquete
        categoria={datos.categoria}
        onCambiar={(categoria) => onChange('categoria', categoria)}
        error={errores.categoria}
        deshabilitado={deshabilitado}
      />

      <ToggleUrgencia
        urgente={datos.es_urgente}
        onCambiar={(urgente) => onChange('es_urgente', urgente)}
        deshabilitado={deshabilitado}
      />

      <Campo
        etiqueta="Descripcion del paquete"
        name="descripcion"
        placeholder="Ej: dos cajas de repuestos delicada"
        ayuda="Que se transporta y como debe manejarse."
        value={datos.descripcion}
        onChange={(evento) => onChange('descripcion', evento.target.value)}
        error={errores.descripcion}
        disabled={deshabilitado}
        maxLength={200}
        contenedor={
          <p className="mt-1 text-right text-xs text-slate-400">
            {datos.descripcion.length}/200
          </p>
        }
      />

      <button
        type="submit"
        disabled={deshabilitado || !puedeEnviar}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3
          text-sm font-semibold text-white shadow-sm transition
          hover:bg-emerald-700 focus-visible:outline-emerald-700
          disabled:cursor-not-allowed disabled:opacity-50"
      >
        Solicitar Envio
      </button>

      {!puedeEnviar && (
        <p className="text-center text-xs text-slate-500">
          Completa el peso y la fecha para solicitar el envio.
        </p>
      )}
    </form>
  )
}
