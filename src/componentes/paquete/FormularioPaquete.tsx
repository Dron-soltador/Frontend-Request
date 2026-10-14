import type { FormEvent } from 'react'

import { Campo } from '../formularios/Campo'

export const CATEGORIAS = [
  { valor: 'Estandar', etiqueta: 'Estandar', descripcion: 'Sin cuidados especiales' },
  { valor: 'Fragil', etiqueta: 'Fragil', descripcion: 'Manejo delicado, +15%' },
] as const

export interface DatosPaquete {
  peso_kg: number
  fecha_programada: string
  /**
   * Unica fuente de verdad de la fragilidad. Antes `categoria` y `es_fragil` eran
   * dos estados independientes y ended desincronizados: el recargo se cobraba
   * mientras el radio "Fragil" seguia marcado como "Estandar".
   * `es_fragil` se deriva de aqui: `esFragil(categoria)`.
   */
  categoria: string
  es_urgente: boolean
  descripcion: string
}

/** El backend cobra el recargo de fragilidad a partir de `es_fragil`. */
export function esFragil(categoria: string): boolean {
  return categoria === 'Fragil'
}

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

      <fieldset>
        <legend className="campo-label">Categoria del paquete</legend>
        <div className="mt-1 grid gap-2.5 sm:grid-cols-2">
          {CATEGORIAS.map((categoria) => {
            const activa = datos.categoria === categoria.valor
            return (
              <label
                key={categoria.valor}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition ${
                  activa
                    ? 'border-marca-600 bg-marca-50 ring-1 ring-marca-600/30'
                    : 'border-slate-300 bg-white hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="categoria"
                  value={categoria.valor}
                  checked={activa}
                  onChange={() => onChange('categoria', categoria.valor)}
                  disabled={deshabilitado}
                  className="mt-0.5 size-4 border-slate-300 text-marca-600 focus:ring-marca-600/30"
                />
                <span>
                  <span className="block text-sm font-medium text-slate-900">
                    {categoria.etiqueta}
                  </span>
                  <span className="block text-xs text-slate-500">{categoria.descripcion}</span>
                </span>
              </label>
            )
          })}
        </div>
        {errores.categoria && (
          <p className="mt-1.5 text-xs font-medium text-red-600">{errores.categoria}</p>
        )}
      </fieldset>

      <label
        className={`flex items-start gap-3 rounded-lg border p-3.5 transition ${
          datos.es_urgente
            ? 'border-amber-400 bg-amber-50'
            : 'border-slate-300 bg-white hover:bg-slate-50'
        }`}
      >
        <input
          type="checkbox"
          checked={datos.es_urgente}
          onChange={(evento) => onChange('es_urgente', evento.target.checked)}
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

/** Fecha local en formato YYYY-MM-DD, para el min del input date. */
function hoy(): string {
  const ahora = new Date()
  const desfase = ahora.getTimezoneOffset() * 60_000
  return new Date(ahora.getTime() - desfase).toISOString().slice(0, 10)
}
