import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import { iniciarSesion, registrar } from '../servicios/auth'
import type { Credenciales } from '../servicios/auth'
import { guardarToken, leerToken, limpiarToken } from '../servicios/clienteHttp'
import { esCliente, leerClaims, sesionExpirada } from './token'
import type { ClaimsToken } from './token'

/** Sesion del cliente persistida en localStorage, como pide la issue. */
export interface Sesion {
  token: string
  claims: ClaimsToken
}

interface ContextoSesion {
  sesion: Sesion | null
  cargando: boolean
  esClienteActual: boolean
  email: string | null
  registrarUsuario: (credenciales: Credenciales) => Promise<string>
  iniciarSesionUsuario: (credenciales: Credenciales) => Promise<void>
  cerrarSesion: () => void
}

const Contexto = createContext<ContextoSesion | null>(null)

/**
 * Lee la sesion persistida. Si el JWT ya vencio se descarta para no dejar al
 * usuario en una pantalla protegida que la API va a rechazar igual.
 */
function cargarSesionInicial(): Sesion | null {
  const token = leerToken()
  const claims = leerClaims(token)

  if (!token || !claims || sesionExpirada(claims)) {
    limpiarToken()
    return null
  }

  return { token, claims }
}

export function ProveedorSesion({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Sesion | null>(cargarSesionInicial)

  const cerrarSesion = useCallback(() => {
    limpiarToken()
    setSesion(null)
  }, [])

  const registrarUsuario = useCallback(async (credenciales: Credenciales) => {
    const respuesta = await registrar(credenciales)
    // El criterio de aceptacion pide que tras el registro el usuario quede en el
    // panel del cliente, asi que encadenamos el login en lugar de pedir que repita
    // el formulario de acceso.
    const login = await iniciarSesion(credenciales)
    guardarToken(login.token)

    const claims = leerClaims(login.token)
    if (!claims) {
      limpiarToken()
      throw new Error('El servidor devolvio una sesion invalida. Intenta iniciar sesion.')
    }

    setSesion({ token: login.token, claims })
    return respuesta.message
  }, [])

  const iniciarSesionUsuario = useCallback(async (credenciales: Credenciales) => {
    const login = await iniciarSesion(credenciales)
    guardarToken(login.token)

    const claims = leerClaims(login.token)
    if (!claims) {
      limpiarToken()
      throw new Error('El servidor devolvio una sesion invalida. Intenta iniciar sesion.')
    }

    setSesion({ token: login.token, claims })
  }, [])

  const valor = useMemo<ContextoSesion>(
    () => ({
      sesion,
      cargando: false,
      esClienteActual: esCliente(sesion?.claims.rol ?? ''),
      email: sesion?.claims.email ?? null,
      registrarUsuario,
      iniciarSesionUsuario,
      cerrarSesion,
    }),
    [sesion, registrarUsuario, iniciarSesionUsuario, cerrarSesion],
  )

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

export function useSesion(): ContextoSesion {
  const contexto = useContext(Contexto)
  if (!contexto) {
    throw new Error('useSesion debe usarse dentro de <ProveedorSesion>')
  }
  return contexto
}