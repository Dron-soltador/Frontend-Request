import { useCallback, useEffect, useRef, useState } from 'react'

import { cotizar } from '../../servicios/pedidos'
import type { Cotizacion, DatosCotizacion } from '../../servicios/pedidos'

/** Espera antes de pedir la tarifa: el usuario deja de escribir mientras corre. */
const ANTIRREBOTE_MS = 400

export type EstadoCotizacion =
  | { estado: 'inactiva' }
  | { estado: 'calculando' }
  | { estado: 'lista'; cotizacion: Cotizacion }
  | { estado: 'error'; mensaje: string }

/**
 * Cotizacion instantanea: cada vez que cambian el peso, la categoria, la
 * urgencia o los puntos del mapa, pide la tarifa al microservicio de Pedidos.
 *
 * Se antirrebota y se cancelan las peticiones anteriores, porque el proyecto
 * exige respuestas por debajo de 1500 ms y no tiene sentido saturar la API con
 * una peticion por tecla pulsada. Gana la ultima respuesta: las que llegan
 * tarde se descartan, para que un cambio rapido no deje el precio viejo.
 *
 * @param clave Serializacion de `datos`. El efecto depende de ella y no del
 *   objeto, que es nuevo en cada render y provocaria un bucle de peticiones.
 */
export function useCotizacion(clave: string, datos: DatosCotizacion | null) {
  const [estado, setEstado] = useState<EstadoCotizacion>({ estado: 'inactiva' })
  const abortar = useRef<AbortController | null>(null)
  // Marca una peticion obsoleta sin tocar el estado visible.
  const token = useRef(0)

  const pedir = useCallback((payload: DatosCotizacion) => {
    token.current += 1
    const actual = token.current

    abortar.current?.abort()
    const controlador = new AbortController()
    abortar.current = controlador

    setEstado((previo) => (previo.estado === 'inactiva' ? previo : { estado: 'calculando' }))

    const temporizador = setTimeout(async () => {
      try {
        const respuesta = await cotizar(payload)
        if (actual !== token.current) return
        setEstado({ estado: 'lista', cotizacion: respuesta.cotizacion })
      } catch (error) {
        if (actual !== token.current) return
        setEstado({
          estado: 'error',
          mensaje: error instanceof Error ? error.message : 'No se pudo cotizar el envio.',
        })
      }
    }, ANTIRREBOTE_MS)

    return () => clearTimeout(temporizador)
  }, [])

  useEffect(() => {
    if (!datos) {
      abortar.current?.abort()
      setEstado({ estado: 'inactiva' })
      return
    }

    const limpiar = pedir(datos)
    return () => {
      limpiar?.()
      abortar.current?.abort()
    }
    // `clave` representa a `datos`: incluir el objeto aqui reintentaria la
    // peticion en cada render.
  }, [clave, datos, pedir])

  return estado
}

/**
 * Serializa los datos de cotizacion para compararlos entre renders.
 * Devuelve cadena vacia cuando aun no hay puntos ni peso.
 */
export function claveCotizacion(datos: DatosCotizacion | null): string {
  if (!datos) return ''
  const { peso_kg, origen, destino, es_fragil, es_urgente } = datos
  return [
    peso_kg,
    origen.latitud,
    origen.longitud,
    destino.latitud,
    destino.longitud,
    es_fragil ? 1 : 0,
    es_urgente ? 1 : 0,
  ].join('|')
}
