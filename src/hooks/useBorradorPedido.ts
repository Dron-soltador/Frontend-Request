import { useCallback, useEffect, useState } from 'react'

import { useAvisos } from '../componentes/avisos/ProveedorAvisos'
import type { PuntoActivo } from '../componentes/mapa/selectorTipos'
import {
  guardarBorrador,
  hayCambiosSinGuardar,
  leerBorrador,
  limpiarBorrador,
} from '../state/borrador'
import type { BorradorPedido } from '../state/borrador'
import {
  eliminarDireccion,
  guardarDireccion,
  listarGuardadas,
} from '../state/localizacion'
import type { DireccionGuardada, PuntoEtiquetado } from '../state/localizacion'

interface Opciones {
  origen: PuntoEtiquetado | null
  destino: PuntoEtiquetado | null
  activo: PuntoActivo
  restaurar: (origen: PuntoEtiquetado | null, destino: PuntoEtiquetado | null) => void
  limpiarPuntos: () => void
}

/**
 * Borrador del pedido (guardado explicito del usuario) y agenda de direcciones
 * habituales. Sin borrador no se restaura nada: el guardado es una accion
 * explicita, no un autoguardado.
 */
export function useBorradorPedido({
  origen,
  destino,
  activo,
  restaurar,
  limpiarPuntos,
}: Opciones) {
  const { exito, info, error } = useAvisos()
  const [borrador, setBorrador] = useState<BorradorPedido | null>(null)
  const [guardadas, setGuardadas] = useState<DireccionGuardada[]>([])
  const [nombre, setNombre] = useState('')

  useEffect(() => {
    const guardado = leerBorrador()
    setBorrador(guardado)
    if (guardado) restaurar(guardado.origen, guardado.destino)
    setGuardadas(listarGuardadas())
  }, [restaurar])

  function guardar() {
    if (!origen || !destino) {
      error('Completa el origen y el destino antes de guardar el pedido.')
      return
    }
    setBorrador(guardarBorrador(origen, destino))
    exito('Pedido guardado en tu sesion. Podras continuar completandolo mas tarde.')
  }

  function descartar() {
    limpiarBorrador()
    setBorrador(null)
    limpiarPuntos()
    info('Borrador descartado y formulario reiniciado.')
  }

  /** Olvida el borrador sin avisar: se usa al completar un envio. */
  const olvidar = useCallback(() => {
    limpiarBorrador()
    setBorrador(null)
  }, [])

  function guardarDireccionActual() {
    const fuente = activo === 'origen' ? origen : destino
    if (!fuente) return
    if (!nombre.trim()) {
      error('Escribe un nombre para identificar la direccion.')
      return
    }
    guardarDireccion(nombre.trim(), fuente.punto, fuente.direccion)
    setGuardadas(listarGuardadas())
    setNombre('')
    exito(`Direccion "${nombre.trim()}" guardada para futuros envios.`)
  }

  function borrarGuardada(id: string) {
    eliminarDireccion(id)
    setGuardadas(listarGuardadas())
  }

  return {
    borrador,
    guardadas,
    nombre,
    setNombre,
    sinGuardar: hayCambiosSinGuardar(borrador, origen, destino),
    guardar,
    descartar,
    olvidar,
    guardarDireccionActual,
    borrarGuardada,
  }
}
