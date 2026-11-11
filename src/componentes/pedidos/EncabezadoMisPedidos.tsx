import { Link } from 'react-router-dom'

/** Cabecera de "Mis pedidos" con accesos a nuevo pedido y al panel. */
export function EncabezadoMisPedidos() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-5 sm:px-8">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Mis pedidos</h1>
          <p className="mt-0.5 text-sm text-slate-600">
            Historial de envios y agenda de entregas programadas.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/pedido"
            className="rounded-lg bg-marca-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-marca-700"
          >
            Nuevo pedido
          </Link>
          <Link
            to="/panel"
            className="rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Volver al panel
          </Link>
        </div>
      </div>
    </header>
  )
}
