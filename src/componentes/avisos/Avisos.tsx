import type { ReactNode } from 'react'

import { ProveedorAvisos, useAvisos } from './ProveedorAvisos'

const ESTILOS = {
  exito: 'border-emerald-300 bg-emerald-50 text-emerald-900',
  error: 'border-red-300 bg-red-50 text-red-900',
  info: 'border-marca-200 bg-white text-slate-900',
} as const

const ICONOS = {
  exito: (
    <path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  ),
  error: <path d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />,
  info: <path d="M11.25 11.25l.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />,
} as const

function ContenedorAvisos() {
  const { avisos, descartar } = useAvisos()

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed inset-x-0 top-0 z-50 flex flex-col items-center gap-2 p-4 sm:items-end"
    >
      {avisos.map((aviso) => (
        <div
          key={aviso.id}
          role="alert"
          className={`animacion-entrada pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border px-4 py-3 shadow-lg ${
            ESTILOS[aviso.tipo]
          }`}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth={1.6}
            stroke="currentColor"
            className="mt-0.5 size-5 shrink-0"
          >
            {ICONOS[aviso.tipo]}
          </svg>
          <p className="flex-1 text-sm leading-snug">{aviso.mensaje}</p>
          <button
            type="button"
            onClick={() => descartar(aviso.id)}
            className="-mr-1 rounded p-1 text-current opacity-60 transition hover:opacity-100"
            aria-label="Cerrar aviso"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth={2}
              stroke="currentColor"
              className="size-4"
            >
              <path d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}

export function Avisos({ children }: { children: ReactNode }) {
  return (
    <ProveedorAvisos>
      {children}
      <ContenedorAvisos />
    </ProveedorAvisos>
  )
}