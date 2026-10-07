import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'

import { useSesion } from '../sesion/SesionContext'

/**
 * Puerta de las vistas privadas. Ademas de exigir sesion, rechaza a los operadores:
 * este repositorio es el portal del cliente y el panel del operador es otro frontend,
 * asi que un JWT con rol "operador" no debe ver /panel.
 *
 * Guarda la ruta solicitada para devolver al usuario a ella tras el login, en vez de
 * dejarlo siempre en la pagina de inicio.
 */
export function RutaProtegida({ children, soloClientes = true }: { children: ReactNode; soloClientes?: boolean }) {
  const { sesion, esClienteActual } = useSesion()
  const ubicacion = useLocation()

  if (!sesion) {
    return <Navigate to="/login" replace state={{ desde: ubicacion.pathname }} />
  }

  if (soloClientes && !esClienteActual) {
    return <Navigate to="/sin-acceso" replace />
  }

  return <>{children}</>
}

/** Inverso de RutaProtegida: si hay sesion, no tiene sentido mostrar login/registro. */
export function RutaPublica({ children }: { children: ReactNode }) {
  const { sesion, esClienteActual } = useSesion()

  if (sesion) {
    return <Navigate to={esClienteActual ? '/panel' : '/sin-acceso'} replace />
  }

  return <>{children}</>
}