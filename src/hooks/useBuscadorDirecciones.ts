import { useCallback, useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'

import type { Sugerencia } from '../services/geocodificacion'
import { useBusquedaNominatim } from './useBusquedaNominatim'

interface Opciones {
  valor: string
  onElegir: (sugerencia: Sugerencia) => void
  onError?: (mensaje: string) => void
}

/**
 * Estado y efectos del buscador de direcciones: consulta con antirrebote,
 * cancelacion de peticiones anteriores, cierre al hacer clic fuera y navegacion
 * por teclado. La vista solo dibuja lo que devuelve este hook.
 */
export function useBuscadorDirecciones({ valor, onElegir, onError }: Opciones) {
  const [consulta, setConsulta] = useState(valor)
  const [sugerencias, setSugerencias] = useState<Sugerencia[]>([])
  const [abierto, setAbierto] = useState(false)
  const [buscando, setBuscando] = useState(false)
  const [indiceActivo, setIndiceActivo] = useState(-1)

  const contenedor = useRef<HTMLDivElement>(null)
  // Tras elegir una sugerencia el campo queda con la direccion completa. Si no
  // marcamos ese caso, el efecto la vuelve a consultar y el desplegable se
  // reabre solo sobre el mapa, tapando lo recien elegido.
  const omitirBusqueda = useRef(false)

  // Si el punto cambia desde afuera (por ejemplo al cargar una direccion
  // guardada), el campo se sincroniza.
  useEffect(() => {
    setConsulta(valor)
  }, [valor])

  useBusquedaNominatim({
    consulta,
    omitir: omitirBusqueda,
    setSugerencias,
    setAbierto,
    setBuscando,
    setIndiceActivo,
    onError: onError ?? (() => {}),
  })

  // Cierra la lista al hacer clic fuera.
  useEffect(() => {
    function alHacerClicFuera(evento: MouseEvent) {
      if (!contenedor.current?.contains(evento.target as Node)) setAbierto(false)
    }
    document.addEventListener('mousedown', alHacerClicFuera)
    return () => document.removeEventListener('mousedown', alHacerClicFuera)
  }, [])

  const elegir = useCallback(
    (sugerencia: Sugerencia) => {
      omitirBusqueda.current = true
      setConsulta(sugerencia.direccion)
      setSugerencias([])
      setAbierto(false)
      setIndiceActivo(-1)
      onElegir(sugerencia)
    },
    [onElegir],
  )

  function escribir(texto: string) {
    // Escribir a mano invalida la omision pendiente: si no, el siguiente texto
    // tecleado se tragaria la bandera.
    omitirBusqueda.current = false
    setConsulta(texto)
  }

  function manejarTeclado(evento: KeyboardEvent<HTMLInputElement>) {
    if (!abierto || sugerencias.length === 0) {
      if (evento.key === 'Escape') setAbierto(false)
      return
    }

    if (evento.key === 'ArrowDown') {
      evento.preventDefault()
      setIndiceActivo((previo) => (previo + 1) % sugerencias.length)
    } else if (evento.key === 'ArrowUp') {
      evento.preventDefault()
      setIndiceActivo((previo) => (previo <= 0 ? sugerencias.length - 1 : previo - 1))
    } else if (evento.key === 'Enter' && indiceActivo >= 0) {
      evento.preventDefault()
      elegir(sugerencias[indiceActivo])
    } else if (evento.key === 'Escape') {
      setAbierto(false)
    }
  }

  function alEnfocar() {
    if (sugerencias.length > 0) setAbierto(true)
  }

  return {
    contenedor,
    consulta,
    sugerencias,
    abierto,
    buscando,
    indiceActivo,
    setIndiceActivo,
    elegir,
    escribir,
    manejarTeclado,
    alEnfocar,
  }
}
