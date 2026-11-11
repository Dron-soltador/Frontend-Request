/**
 * El backend de Pedidos solo expone POST /auth/login y POST /auth/register, asi que
 * no existe un endpoint /auth/me del cual recuperar el perfil. La informacion del
 * usuario viaja dentro del JWT (payload: usuario_id, email, rol, exp) y la leemos aqui.
 *
 * La firma del JWT se valida en el backend en cada peticion protegida; decodificarlo
 * en el navegador es solo para mostrar el nombre del usuario y expirar la sesion local.
 */

export interface ClaimsToken {
  usuario_id: number
  email: string
  rol: string
  exp: number
}

function decodificarBase64Url(valor: string): string {
  const normalizado = valor.replace(/-/g, '+').replace(/_/g, '/')
  const relleno = normalizado.padEnd(normalizado.length + ((4 - (normalizado.length % 4)) % 4), '=')
  return atob(relleno)
}

/** Devuelve null si el token no existe o su payload no es un JWT legible. */
export function leerClaims(token: string | null): ClaimsToken | null {
  if (!token) return null

  const segmentos = token.split('.')
  if (segmentos.length !== 3) return null

  try {
    const payload = JSON.parse(decodificarBase64Url(segmentos[1])) as Partial<ClaimsToken>
    if (typeof payload.email !== 'string' || typeof payload.rol !== 'string') return null

    return {
      usuario_id: Number(payload.usuario_id ?? 0),
      email: payload.email,
      rol: payload.rol,
      exp: Number(payload.exp ?? 0),
    }
  } catch {
    return null
  }
}

/** `exp` esta en segundos epoch. Devolvemos margen de 30 s para evitar cortes en seco. */
export function sesionExpirada(claims: ClaimsToken | null): boolean {
  if (!claims) return true
  if (!claims.exp) return false
  return Date.now() >= (claims.exp - 30) * 1000
}

export function esCliente(rol: string): boolean {
  return rol.toLowerCase() === 'cliente'
}