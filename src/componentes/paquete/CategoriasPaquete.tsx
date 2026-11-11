import { CATEGORIAS } from './modeloPaquete'

interface Props {
  categoria: string
  onCambiar: (categoria: string) => void
  error?: string
  deshabilitado: boolean
}

/** Selector de categoria (Estandar / Fragil) con el recargo visible. */
export function CategoriasPaquete({ categoria, onCambiar, error, deshabilitado }: Props) {
  return (
    <fieldset>
      <legend className="campo-label">Categoria del paquete</legend>
      <div className="mt-1 grid gap-2.5 sm:grid-cols-2">
        {CATEGORIAS.map((opcion) => {
          const activa = categoria === opcion.valor
          return (
            <label
              key={opcion.valor}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition ${
                activa
                  ? 'border-marca-600 bg-marca-50 ring-1 ring-marca-600/30'
                  : 'border-slate-300 bg-white hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="categoria"
                value={opcion.valor}
                checked={activa}
                onChange={() => onCambiar(opcion.valor)}
                disabled={deshabilitado}
                className="mt-0.5 size-4 border-slate-300 text-marca-600 focus:ring-marca-600/30"
              />
              <span>
                <span className="block text-sm font-medium text-slate-900">{opcion.etiqueta}</span>
                <span className="block text-xs text-slate-500">{opcion.descripcion}</span>
              </span>
            </label>
          )
        })}
      </div>
      {error && <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>}
    </fieldset>
  )
}
