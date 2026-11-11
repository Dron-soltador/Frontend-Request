import { useCallback, useEffect, useMemo, useState } from 'react'

import { useAvisos } from '../componentes/avisos/ProveedorAvisos'
import { diaProgramado, ordenarRecientesPrimero } from '../componentes/pedidos/fechas'
import { ErrorApi } from '../services/clienteHttp'
import { obtenerPedidosUsuario } from '../services/pedidos'
import type { Pedido } from '../services/pedidos'
import { useSesion } from '../state/SesionContext'

export type Carga =
  | { estado: 'cargando' }
  | { estado: 'error'; mensaje: string }
  | { estado: 'lista'; pedidos: Pedido[] }

/**
 * Carga el historial del usuario autenticado y calcula las vistas derivadas:
 * pedidos del dia seleccionado y conteo por estado. Si el JWT vencio, cierra la
 * sesion y avisa; el resto de errores quedan disponibles para reintentar.
 */
export function usePedidosUsuario() {
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
        mensaje:
          'Tu sesion no incluye un identificador de usuario. Cierra sesion e ingresa de nuevo.',
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
    () =>
      diaSeleccionado
        ? pedidos.filter((pedido) => diaProgramado(pedido) === diaSeleccionado)
        : pedidos,
    [pedidos, diaSeleccionado],
  )

  const conteo = useMemo(() => {
    const cuenta: Record<string, number> = {}
    for (const pedido of pedidos) cuenta[pedido.estado] = (cuenta[pedido.estado] ?? 0) + 1
    return cuenta
  }, [pedidos])

  return {
    carga,
    pedidos,
    visibles,
    conteo,
    diaSeleccionado,
    setDiaSeleccionado,
    reintentar,
  }
}
