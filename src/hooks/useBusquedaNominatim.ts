import { useEffect, useRef } from 'react'

import { buscarDirecciones } from '../services/geocodificacion'
import type { Sugerencia } from '../services/geocodificacion'

/** Espera antes de consultar Nominatim mientras el usuario sigue escribiendo. */
const RETARDO_BUSQUEDA_MS = 400
const LONGITUD_MINIMA = 3

interface Opciones {
  consulta: string
  /** Bandera mutable: tras elegir una sugerencia no se vuelve a consultar. */
  omitir: { current: boolean }
  setSugerencias: (sugerencias: Sugerencia[]) => void
  setAbierto: (abierto: boolean) => void
  setBuscando: (buscando: boolean) => void
  setIndiceActivo: (indice: number) => void
  onError: (mensaje: string) => void
}

/**
 * Consulta Nominatim con antirrebote y cancela la peticion anterior. Gana la
 * ultima respuesta: las que llegan tarde se descartan.
 */
export function useBusquedaNominatim({
  consulta,
  omitir,
  setSugerencias,
  setAbierto,
  setBuscando,
  setIndiceActivo,
  onError,
}: Opciones) {
  const abortar = useRef<AbortController | null>(null)
  /**
   * `onError` llega del contexto de avisos y cambia de identidad cada vez que se
   * muestra un toast. Si fuera dependencia del efecto, cada mensaje dispararia
   * una consulta nueva y reabriria el desplegable.
   */
  const onErrorRef = useRef(onError)
  onErrorRef.current = onError

  useEffect(() => {
    const texto = consulta.trim()

    if (omitir.current) {
      omitir.current = false
      setSugerencias([])
      setAbierto(false)
      setBuscando(false)
      return
    }

    if (texto.length < LONGITUD_MINIMA) {
      setSugerencias([])
      setAbierto(false)
      setBuscando(false)
      return
    }

    setBuscando(true)
    const temporizador = setTimeout(async () => {
      abortar.current?.abort()
      const controlador = new AbortController()
      abortar.current = controlador

      try {
        const resultados = await buscarDirecciones(texto, controlador.signal)
        if (controlador.signal.aborted) return
        setSugerencias(resultados)
        setIndiceActivo(-1)
        setAbierto(resultados.length > 0)
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
        onErrorRef.current(
          error instanceof Error ? error.message : 'Error al buscar direcciones.',
        )
      } finally {
        if (!controlador.signal.aborted) setBuscando(false)
      }
    }, RETARDO_BUSQUEDA_MS)

    return () => clearTimeout(temporizador)
    // Solo depende de lo escrito: los setters son estables y `onError` va por ref.
  }, [consulta])
}
