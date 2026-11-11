import { useState } from 'react'

import { useAvisos } from '../componentes/avisos/ProveedorAvisos'
import { esFragil } from '../componentes/paquete/modeloPaquete'
import type { DatosPaquete } from '../componentes/paquete/modeloPaquete'
import { ErrorApi } from '../services/clienteHttp'
import { crearPedido } from '../services/pedidos'
import type { PedidoRegistrado } from '../services/pedidos'
import { useSesion } from '../state/SesionContext'
import type { PuntoEtiquetado } from '../state/localizacion'
import type { EstadoCotizacion } from './useCotizacion'

interface Opciones {
  origen: PuntoEtiquetado | null
  destino: PuntoEtiquetado | null
  paquete: DatosPaquete
  cotizacion: EstadoCotizacion
  validarPaquete: () => boolean
  /** Limpia formulario, paquete y borrador tras un alta exitosa. */
  onExito: () => void
}

type UltimoPedido = { id: number; costo: number | null; notificado: boolean } | null

/**
 * Alta del pedido contra `POST /api/v1/pedidos`. Si el backend responde 502 el
 * pedido ya quedo guardado y solo fallo la notificacion al despachador: se
 * informa como registro parcial para no duplicarlo al reintentar.
 */
export function useEnvioPedido({
  origen,
  destino,
  paquete,
  cotizacion,
  validarPaquete,
  onExito,
}: Opciones) {
  const { exito, info, error } = useAvisos()
  const { email, sesion } = useSesion()
  const [enviando, setEnviando] = useState(false)
  const [ultimoPedido, setUltimoPedido] = useState<UltimoPedido>(null)

  async function enviar() {
    if (!origen || !destino) {
      error('Define el origen y el destino antes de solicitar el envio.')
      return
    }
    if (!validarPaquete()) {
      error('Revisa los campos marcados antes de solicitar el envio.')
      return
    }
    if (cotizacion.estado !== 'lista') {
      error('Espera a que termine la cotizacion antes de enviar.')
      return
    }

    setEnviando(true)
    try {
      const respuesta = await crearPedido({
        peso_kg: paquete.peso_kg,
        origen: origen.punto,
        destino: destino.punto,
        es_fragil: esFragil(paquete.categoria),
        es_urgente: paquete.es_urgente,
        // El backend exige `cliente` y `direccion`. El cliente es la cuenta
        // autenticada y la direccion, el destino elegido en el mapa.
        // Sin usuario_id el pedido no aparece luego en "Mis pedidos".
        usuario_id: sesion?.claims.usuario_id || undefined,
        cliente: email ?? 'Cliente',
        direccion: destino.direccion || 'Punto definido en el mapa',
        categoria: paquete.categoria,
        fecha_programada: paquete.fecha_programada,
        descripcion: paquete.descripcion,
        costo_total: cotizacion.cotizacion.costo_total,
      })

      setUltimoPedido({
        id: respuesta.pedido.id,
        costo: respuesta.pedido.costo_total,
        notificado: true,
      })
      exito(`Pedido #${respuesta.pedido.id} registrado. Estado: ${respuesta.pedido.estado}.`)
      onExito()
    } catch (excepcion) {
      /**
       * 502 no es un fallo del cliente: el backend confirma que guardo el
       * pedido y solo no logro avisar al despachador del administrador. Tratarlo
       * como error dejaria al cliente creyendo que no se registro nada cuando si
       * esta en la base de datos, y duplicaria el pedido al reintentar.
       */
      const parcial = excepcion instanceof ErrorApi ? leerPedidoParcial(excepcion) : null

      if (parcial) {
        setUltimoPedido({
          id: parcial.id,
          costo: parcial.costo_total,
          notificado: false,
        })
        info(
          `Pedido #${parcial.id} registrado, pero el despachador no respondio a tiempo. Queda pendiente de asignacion.`,
        )
        onExito()
        return
      }

      error(
        excepcion instanceof ErrorApi
          ? excepcion.message
          : 'No se pudo registrar el pedido. Intenta de nuevo.',
      )
    } finally {
      setEnviando(false)
    }
  }

  const puedeEnviar =
    Boolean(origen && destino) &&
    paquete.peso_kg > 0 &&
    paquete.fecha_programada !== '' &&
    cotizacion.estado === 'lista' &&
    !enviando

  return { enviando, ultimoPedido, enviar, puedeEnviar }
}

/**
 * Extrae el pedido de un 502. El backend lo incluye en el cuerpo porque el
 * commit ya se hizo: lo que fallo fue unicamente la notificacion al despachador.
 */
function leerPedidoParcial(excepcion: ErrorApi): PedidoRegistrado | null {
  if (excepcion.estado !== 502) return null
  const cuerpo = excepcion.datos as { pedido?: PedidoRegistrado } | null
  return cuerpo?.pedido && typeof cuerpo.pedido.id === 'number' ? cuerpo.pedido : null
}
