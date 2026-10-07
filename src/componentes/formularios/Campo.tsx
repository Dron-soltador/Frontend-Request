import type { InputHTMLAttributes, ReactNode } from 'react'
import { useId, useState } from 'react'

interface CampoProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  etiqueta: string
  error?: string
  ayuda?: string
  /** Renderiza el boton de mostrar/ocultar para campos de tipo password. */
  esSecreto?: boolean
  contenedor?: ReactNode
}

export function Campo({ etiqueta, error, ayuda, esSecreto, contenedor, ...props }: CampoProps) {
  const id = useId()
  const descripcionId = `${id}-descripcion`
  const [visible, setVisible] = useState(false)

  const tipoFinal = esSecreto ? (visible ? 'text' : 'password') : props.type

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="campo-label">
        {etiqueta}
      </label>

      <div className="relative">
        <input
          {...props}
          id={id}
          type={tipoFinal}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || ayuda ? descripcionId : undefined}
          className={`campo-input ${error ? 'campo-error' : ''} ${esSecreto ? 'pr-11' : ''}`}
        />

        {esSecreto && (
          <button
            type="button"
            onClick={() => setVisible((previo) => !previo)}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-500 transition hover:text-slate-700"
            aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            tabIndex={-1}
          >
            {visible ? (
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth={1.6}
                stroke="currentColor"
                className="size-5"
              >
                <path d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243" />
              </svg>
            ) : (
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth={1.6}
                stroke="currentColor"
                className="size-5"
              >
                <path d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            )}
          </button>
        )}
      </div>

      {(error || ayuda) && (
        <p
          id={descripcionId}
          className={`text-xs ${error ? 'font-medium text-red-600' : 'text-slate-500'}`}
        >
          {error ?? ayuda}
        </p>
      )}

      {contenedor}
    </div>
  )
}