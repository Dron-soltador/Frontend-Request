import { useRef, useState } from 'react'

/**
 * Cuenta las teselas en vuelo para quitar el overlay solo cuando la pantalla
 * esta completa. Sin esto el mapa aparece gris y salta al cargar. Tras la
 * primera carga nunca mas se tapa el mapa: desplazar o zoomear pide teselas
 * nuevas y un overlay a pantalla completa se percibe como un fallo.
 */
export function useTeselasMapa() {
  const [cargandoInicial, setCargandoInicial] = useState(true)
  const [errorTeselas, setErrorTeselas] = useState(false)
  const pendientes = useRef(0)
  const primeraCarga = useRef(true)

  function controlarTeselas(evento: 'loading' | 'load' | 'tileerror') {
    return () => {
      if (evento === 'loading') {
        pendientes.current += 1
        return
      }
      if (evento === 'tileerror') {
        setErrorTeselas(true)
        setCargandoInicial(false)
        return
      }

      pendientes.current = Math.max(0, pendientes.current - 1)
      if (pendientes.current === 0 && primeraCarga.current) {
        primeraCarga.current = false
        setCargandoInicial(false)
      }
    }
  }

  return { cargandoInicial, errorTeselas, controlarTeselas }
}
