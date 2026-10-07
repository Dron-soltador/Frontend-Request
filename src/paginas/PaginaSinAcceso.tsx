import { Link, useNavigate } from 'react-router-dom'

import { useSesion } from '../sesion/SesionContext'

/**
 * Pantalla para cuando el token es valido pero no habilita este portal (rol operador,
 * o token corrupto). Cerrar la sesion es siempre la salida.
 */
export default function PaginaSinAcceso() {
  const navegar = useNavigate()
  const { sesion, email, cerrarSesion } = useSesion()

  function manejarCierre() {
    cerrarSesion()
    navegar('/login', { replace: true })
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-5 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-amber-100">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth={1.6}
            stroke="currentColor"
            className="size-6 text-amber-700"
          >
            <path
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1 className="mt-5 text-xl font-bold text-slate-900">No tienes acceso a este portal</h1>
        <p className="mt-2 text-sm text-slate-600">
          {sesion
            ? `La cuenta ${email} esta registrada con el rol "${sesion.claims.rol}". El panel de clientes es exclusivo para cuentas de tipo cliente.`
            : 'Tu sesion no es valida. Vuelve a iniciar sesion para continuar.'}
        </p>

        <button
          type="button"
          onClick={manejarCierre}
          className="mt-6 w-full rounded-lg bg-marca-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-marca-700"
        >
          Cerrar sesion
        </button>

        <p className="mt-4 text-sm text-slate-500">
          Si crees que es un error,{' '}
          <Link
            to="/login"
            className="font-medium text-marca-700 underline-offset-4 hover:underline"
          >
            vuelve a iniciar sesion
          </Link>
          .
        </p>
      </div>
    </div>
  )
}