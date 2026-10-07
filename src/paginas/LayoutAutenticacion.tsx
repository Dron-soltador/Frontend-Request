import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

/**
 * Layout compartido por login y registro: columna informativa a la izquierda
 * (oculta en movil) y formulario a la derecha. `esOpcional` oculta el enlace
 * cruzado cuando ya estamos en la pantalla destino.
 */
export function LayoutAutenticacion({
  titulo,
  descripcion,
  children,
  pie,
}: {
  titulo: string
  descripcion: string
  children: ReactNode
  pie?: ReactNode
}) {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-marca-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden="true"
          className="absolute -right-24 -top-24 size-96 rounded-full bg-marca-500/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-32 -left-16 size-80 rounded-full bg-marca-500/10 blur-3xl"
        />

        <Link to="/" className="relative flex items-center gap-3 text-lg font-semibold">
          <Marca />
          DroneExpress
        </Link>

        <div className="relative max-w-md">
          <h2 className="text-3xl leading-tight font-bold">
            Entregas con drones en tu ciudad, sin limites de trafico
          </h2>
          <p className="mt-4 text-marca-100">
            Solicita el envio de tus paquetes, marca el origen y el destino en el mapa y
            sigue el estado de cada entrega desde un solo panel.
          </p>

          <ul className="mt-10 space-y-4 text-sm text-marca-100">
            <li className="flex items-start gap-3">
              <IconoCheck />
              Cotizacion inmediata segun distancia, peso y recargos.
            </li>
            <li className="flex items-start gap-3">
              <IconoCheck />
              Flota de drones monitoreada en tiempo real.
            </li>
            <li className="flex items-start gap-3">
              <IconoCheck />
              Agenda de entregas programadas.
            </li>
          </ul>
        </div>

        <p className="relative text-xs text-marca-200">
          Proyecto academico de microservicios &middot; React + Flask + PostgreSQL
        </p>
      </aside>

      <main className="flex min-h-dvh flex-col justify-center px-5 py-10 sm:px-8 lg:min-h-dvh lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <Link
            to="/"
            className="mb-10 flex items-center gap-2.5 text-lg font-semibold text-marca-900 lg:hidden"
          >
            <Marca />
            DroneExpress
          </Link>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {titulo}
          </h1>
          <p className="mt-2 text-sm text-slate-600">{descripcion}</p>

          <div className="mt-8">{children}</div>

          {pie && <div className="mt-8 text-center text-sm text-slate-600">{pie}</div>}
        </div>
      </main>
    </div>
  )
}

export function Marca({ className = 'size-9' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect width="24" height="24" rx="6" className="fill-marca-600" />
      <path
        d="M12 6.5 15 12m-3 0-3-5.5M15 12h3.5M15 12 12 17m0-5L8.5 17.5M12 17h3"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="18.5" cy="12" r="1.6" className="fill-white" />
    </svg>
  )
}

function IconoCheck() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={2}
      stroke="currentColor"
      className="mt-0.5 size-4 shrink-0 text-marca-200"
    >
      <path d="m4.5 12.75 6 6 9-13.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}