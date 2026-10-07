import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'

export type TipoAviso = 'exito' | 'error' | 'info'

export interface Aviso {
  id: number
  tipo: TipoAviso
  mensaje: string
}

interface ContextoAvisos {
  avisos: Aviso[]
  notificar: (mensaje: string, tipo?: TipoAviso) => void
  exito: (mensaje: string) => void
  error: (mensaje: string) => void
  info: (mensaje: string) => void
  descartar: (id: number) => void
}

const Contexto = createContext<ContextoAvisos | null>(null)

const DURACION_POR_DEFECTO_MS = 5000

/**
 * Mensajes emergentes pedidos en los criterios de aceptacion. Sin libreria
 * externa: un stack de toasts accesible con role="alert" para lectores de pantalla.
 */
export function ProveedorAvisos({ children }: { children: ReactNode }) {
  const [avisos, setAvisos] = useState<Aviso[]>([])
  const siguienteId = useRef(0)

  const descartar = useCallback((id: number) => {
    setAvisos((previos) => previos.filter((aviso) => aviso.id !== id))
  }, [])

  const notificar = useCallback(
    (mensaje: string, tipo: TipoAviso = 'info') => {
      const id = siguienteId.current++
      setAvisos((previos) => [...previos, { id, tipo, mensaje }])
      setTimeout(() => descartar(id), DURACION_POR_DEFECTO_MS)
    },
    [descartar],
  )

  const valor = useMemo<ContextoAvisos>(
    () => ({
      avisos,
      notificar,
      exito: (mensaje: string) => notificar(mensaje, 'exito'),
      error: (mensaje: string) => notificar(mensaje, 'error'),
      info: (mensaje: string) => notificar(mensaje, 'info'),
      descartar,
    }),
    [avisos, notificar, descartar],
  )

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

export function useAvisos(): ContextoAvisos {
  const contexto = useContext(Contexto)
  if (!contexto) {
    throw new Error('useAvisos debe usarse dentro de <ProveedorAvisos>')
  }
  return contexto
}