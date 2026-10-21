import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { useAvisos } from '../componentes/avisos/ProveedorAvisos'
import { CalendarioPedidos } from '../componentes/pedidos/CalendarioPedidos'
import { ESTADOS_ORDENADOS, estiloEstado } from '../componentes/pedidos/EtiquetaEstado'
import { TablaPedidos } from '../componentes/pedidos/TablaPedidos'
import { diaProgramado, formatearDia, ordenarRecientesPrimero } from '../componentes/pedidos/fechas'
import { Spinner } from '../componentes/ui/Spinner'
import { obtenerPedidosUsuario } from '../servicios/pedidos'
import type { Pedido } from '../servicios/pedidos'
import { ErrorApi } from '../servicios/clienteHttp'
import { useSesion } from '../sesion/SesionContext'

type Carga =
  | { estado: 'cargando' }
  | { estado: 'error'; mensaje: string }
  | { estado: 'lista'; pedidos: Pedido[] }

/**
 * "Mis pedidos": historial en tabla + agenda mensual.
 * Consume `GET /api/v1/pedidos/usuario/:id` con el `usuario_id` del JWT.
 */
export default function PaginaMisPedidos() {
  const { sesion, cerrarSesion } = useSesion()
  const { info } = useAvisos()
  const usuarioId = sesion?.claims.usuario_id ?? 0

  const [carga, setCarga] = useState<Carga>({ estado: 'cargando' })
  const [intento, setIntento] = useState(0)
  const [diaSeleccionado, setDiaSeleccionado] = useState<string | null>(null)

  useEffect(() => {
    if (!usuarioId) {
      setCarga({
        estado: 'error',
        mensaje: 'Tu sesion no incluye un identificador de usuario. Cierra sesion e ingresa de nuevo.',
      })
      return
    }

    let cancelado = false
    setCarga({ estado: 'cargando' })

    obtenerPedidosUsuario(usuarioId)
      .then((pedidos) => {
        if (!cancelado) setCarga({ estado: 'lista', pedidos: ordenarRecientesPrimero(pedidos) })
      })
      .catch((excepcion: unknown) => {
        if (cancelado) return
        if (excepcion instanceof ErrorApi && excepcion.esNoAutorizado) {
          info('Tu sesion vencio. Ingresa de nuevo.')
          cerrarSesion()
          return
        }
        setCarga({
          estado: 'error',
          mensaje:
            excepcion instanceof ErrorApi
              ? excepcion.message
              : 'No se pudo cargar tu historial de pedidos.',
        })
      })

    return () => {
      cancelado = true
    }
  }, [usuarioId, intento, cerrarSesion, info])

  const reintentar = useCallback(() => setIntento((n) => n + 1), [])

  const pedidos = carga.estado === 'lista' ? carga.pedidos : []

  const visibles = useMemo(
    () => (diaSeleccionado ? pedidos.filter((p) => diaProgramado(p) === diaSeleccionado) : pedidos),
    [pedidos, diaSeleccionado],
  )

  const conteo = useMemo(() => {
    const cuenta: Record<string, number> = {}
    for (const pedido of pedidos) cuenta[pedido.estado] = (cuenta[pedido.estado] ?? 0) + 1
    return cuenta
  }, [pedidos])

  return (
    <div className="flex min-h-dvh flex-col bg-slate-100">
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

      <main className="mx-auto w-full max-w-6xl flex-1 space-y-5 px-5 py-6 sm:px-8 sm:py-8">
        {carga.estado === 'cargando' && (
          <div
            role="status"
            className="flex items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white px-5 py-12 text-sm text-slate-600 shadow-sm"
          >
            <Spinner className="size-5 text-marca-600" />
            Cargando tus pedidos...
          </div>
        )}

        {carga.estado === 'error' && (
          <div
            role="alert"
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-900"
          >
            <span>{carga.mensaje}</span>
            <button
              type="button"
              onClick={reintentar}
              className="rounded-lg border border-red-300 bg-white px-3.5 py-1.5 font-semibold text-red-800 transition hover:bg-red-100"
            >
              Reintentar
            </button>
          </div>
        )}

        {carga.estado === 'lista' && (
          <>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {ESTADOS_ORDENADOS.map((estado) => (
                <li key={estado} className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                    <span aria-hidden="true" className={`size-2 rounded-full ${estiloEstado(estado).punto}`} />
                    {estiloEstado(estado).etiqueta}
                  </div>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{conteo[estado] ?? 0}</p>
                </li>
              ))}
            </ul>

            <div className="grid items-start gap-5 lg:grid-cols-[22rem_1fr]">
              <CalendarioPedidos
                pedidos={pedidos}
                diaSeleccionado={diaSeleccionado}
                onSeleccionar={setDiaSeleccionado}
              />

              <section className="rounded-xl border border-slate-200 bg-white shadow-sm" aria-labelledby="titulo-historial">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-5 py-3.5">
                  <div>
                    <h2 id="titulo-historial" className="text-sm font-semibold text-slate-900">
                      {diaSeleccionado ? `Envios del ${formatearDia(diaSeleccionado)}` : 'Historial de envios'}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {diaSeleccionado
                        ? 'Filtrado por fecha de entrega programada.'
                        : 'Del mas reciente al mas antiguo.'}
                    </p>
                  </div>
                  {diaSeleccionado && (
                    <button
                      type="button"
                      onClick={() => setDiaSeleccionado(null)}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Ver todos
                    </button>
                  )}
                </div>

                <TablaPedidos pedidos={visibles} hayFiltro={diaSeleccionado !== null} />
              </section>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
