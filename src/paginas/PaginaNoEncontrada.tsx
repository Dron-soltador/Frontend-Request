import { Link } from 'react-router-dom'

export default function PaginaNoEncontrada() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-5 py-12">
      <div className="text-center">
        <p className="text-sm font-semibold text-marca-700">Error 404</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          Pagina no encontrada
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          La ruta que buscas no existe en el portal de clientes.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-lg bg-marca-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-marca-700"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}