import { useMemo } from 'react'

import { esFragil } from '../componentes/paquete/modeloPaquete'
import type { DatosPaquete } from '../componentes/paquete/modeloPaquete'
import type { DatosCotizacion } from '../services/pedidos'
import type { PuntoEtiquetado } from '../state/localizacion'
import { claveCotizacion, useCotizacion } from './useCotizacion'

/**
 * Datos de cotizacion derivados del formulario. Se anulan mientras falte el
 * peso o los puntos, para no pedir una tarifa que el backend va a rechazar.
 */
export function useCotizacionPedido(
  origen: PuntoEtiquetado | null,
  destino: PuntoEtiquetado | null,
  paquete: DatosPaquete,
) {
  const datos = useMemo<DatosCotizacion | null>(() => {
    if (!origen || !destino || paquete.peso_kg <= 0) return null
    return {
      peso_kg: paquete.peso_kg,
      origen: origen.punto,
      destino: destino.punto,
      es_fragil: esFragil(paquete.categoria),
      es_urgente: paquete.es_urgente,
    }
  }, [origen, destino, paquete.peso_kg, paquete.categoria, paquete.es_urgente])

  return useCotizacion(claveCotizacion(datos), datos)
}
