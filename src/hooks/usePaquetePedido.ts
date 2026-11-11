import { useCallback, useState } from 'react'

import { PAQUETE_VACIO } from '../componentes/paquete/modeloPaquete'
import type { DatosPaquete } from '../componentes/paquete/modeloPaquete'

/** Estado y validacion de los datos del paquete (paso 2 del pedido). */
export function usePaquetePedido() {
  const [paquete, setPaquete] = useState<DatosPaquete>(PAQUETE_VACIO)
  const [erroresPaquete, setErroresPaquete] = useState<
    Partial<Record<keyof DatosPaquete, string>>
  >({})

  const cambiarPaquete = useCallback(
    <K extends keyof DatosPaquete>(campo: K, valor: DatosPaquete[K]) => {
      setPaquete((previo) => ({ ...previo, [campo]: valor }))
      setErroresPaquete((previos) => ({ ...previos, [campo]: undefined }))
    },
    [],
  )

  function validarPaquete(): boolean {
    const errores: Partial<Record<keyof DatosPaquete, string>> = {}

    if (!(paquete.peso_kg > 0)) {
      errores.peso_kg = 'Ingresa el peso del paquete.'
    } else if (paquete.peso_kg > 50) {
      errores.peso_kg = 'El peso maximo por paquete es 50 kg.'
    }

    if (!paquete.fecha_programada) {
      errores.fecha_programada = 'Elige la fecha de entrega.'
    }

    setErroresPaquete(errores)
    return Object.keys(errores).length === 0
  }

  const limpiarPaquete = useCallback(() => {
    setPaquete(PAQUETE_VACIO)
    setErroresPaquete({})
  }, [])

  return { paquete, erroresPaquete, cambiarPaquete, validarPaquete, limpiarPaquete }
}
