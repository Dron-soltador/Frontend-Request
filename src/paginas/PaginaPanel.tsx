import { Link } from 'react-router-dom'

import { Marca } from './LayoutAutenticacion'
import { useSesion } from '../sesion/SesionContext'

/**
 * Cabecera del portal del cliente. La issue #1 solo habilita el acceso, asi que el
 * cuerpo es un marcador de posicion; los modulos de cotizacion, flota y calendario
 * se incorporan aqui en sus respectivas issues sin romper el layout.
 */
export default function PaginaPanel() {
  const { email, cerrarSesion } = useSesion()

  const modulos = [
    {
      titulo: 'Cotizar y solicitar envio',
      descripcion: 'Peso, categoria, urgencia y puntos A/B en el mapa.',
      estado: 'Proximamente',
    },
    {
      titulo: 'Definir puntos de entrega',
      descripcion: 'Mapa interactivo con marcadores arrastrables para origen y destino.',
      estado: 'Disponible',
      enlace: '/puntos',
    },
    {
      titulo: 'Mis pedidos',
      descripcion: 'Seguimiento del estado de cada entrega en curso.',
      estado: 'Proximamente',
    },
    {
      titulo: 'Calendario de entregas',
      descripcion: 'Agenda de los envios programados por fecha.',
      estado: 'Proximamente',
    },
  ] as const

  return (
    <div className="min-h-dvh bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <div className="flex items-center gap-2.5 font-semibold text-marca-900">
            <Marca />
            <span className="hidden sm:inline">DroneExpress</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden max-w-56 truncate text-sm text-slate-600 sm:inline">
              {email}
            </span>
            <button
              type="button"
              onClick={cerrarSesion}
              className="rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Cerrar sesion
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-900">
          Sesion activa. Ya puedes operar las funciones de cliente sin ver las del operador.
        </div>

        <h1 className="mt-8 text-2xl font-bold tracking-tight text-slate-900">
          Panel del cliente
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Accediste correctamente. Estos modulos se habilitan en las siguientes issues del
          portal.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modulos.map((modulo) => (
            <article
              key={modulo.titulo}
              className={`rounded-xl border bg-white p-5 shadow-sm ${
                'enlace' in modulo ? 'border-emerald-200' : 'border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                    'enlace' in modulo
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {modulo.estado}
                </span>
              </div>
              <h2 className="mt-3 font-semibold text-slate-900">{modulo.titulo}</h2>
              <p className="mt-1 text-sm text-slate-600">{modulo.descripcion}</p>

              {'enlace' in modulo && (
                <Link
                  to={modulo.enlace}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-marca-700 underline-offset-4 hover:underline"
                >
                  Abrir el mapa
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="size-4"
                  >
                    <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              )}
            </article>
          ))}
        </div>

        <Link
          to="/login"
          className="mt-8 inline-block text-sm font-medium text-marca-700 underline-offset-4 hover:underline"
        >
          Volver al inicio de sesion
        </Link>
      </main>
    </div>
  )
}