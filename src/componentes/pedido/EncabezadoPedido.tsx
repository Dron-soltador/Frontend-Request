interface Props {
  puedeEnviar: boolean
}

function Paso({
  numero,
  titulo,
  estado,
}: {
  numero: number
  titulo: string
  estado: 'activo' | 'pendiente'
}) {
  const activo = estado === 'activo'
  return (
    <li className="flex items-center gap-1.5">
      <span
        className={`flex size-5 items-center justify-center rounded-full text-[11px] font-bold ${
          activo ? 'bg-marca-600 text-white' : 'bg-slate-200 text-slate-500'
        }`}
      >
        {numero}
      </span>
      <span className={activo ? 'font-semibold text-marca-800' : 'text-slate-500'}>{titulo}</span>
    </li>
  )
}

function Separador() {
  return (
    <li aria-hidden="true" className="text-slate-300">
      /
    </li>
  )
}

/** Cabecera del flujo de pedido con los tres pasos. */
export function EncabezadoPedido({ puedeEnviar }: Props) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-5 py-5 sm:px-8">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Hacer un pedido</h1>
        <p className="mt-0.5 text-sm text-slate-600">
          Define los puntos de entrega, cargua los datos del paquete y mira la tarifa antes de
          confirmar.
        </p>

        <ol className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
          <Paso numero={1} titulo="Puntos de entrega" estado="activo" />
          <Separador />
          <Paso numero={2} titulo="Datos del paquete" estado="activo" />
          <Separador />
          <Paso
            numero={3}
            titulo="Confirmar y enviar"
            estado={puedeEnviar ? 'activo' : 'pendiente'}
          />
        </ol>
      </div>
    </header>
  )
}
