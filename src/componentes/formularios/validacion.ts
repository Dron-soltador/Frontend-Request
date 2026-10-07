/** Validaciones de formulario espejo de lo que exige el backend (email unico, argon2). */

const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export const LONGITUD_MINIMA_PASSWORD = 8

export interface ResultadoValidacion {
  valido: boolean
  errores: Record<string, string>
}

export function validarEmail(email: string): string | null {
  if (!email.trim()) return 'Ingresa tu correo electronico.'
  if (!RE_EMAIL.test(email.trim())) return 'El formato del correo no es valido.'
  return null
}

export function validarPassword(password: string): string | null {
  if (!password) return 'Ingresa tu contrasena.'
  if (password.length < LONGITUD_MINIMA_PASSWORD) {
    return `La contrasena debe tener al menos ${LONGITUD_MINIMA_PASSWORD} caracteres.`
  }
  return null
}

export function validarFormularioRegistro(
  email: string,
  password: string,
  confirmacion: string,
): ResultadoValidacion {
  const errores: Record<string, string> = {}

  const errorEmail = validarEmail(email)
  if (errorEmail) errores.email = errorEmail

  const errorPassword = validarPassword(password)
  if (errorPassword) errores.password = errorPassword

  if (confirmacion !== password) {
    errores.confirmacion = 'Las contrasenas no coinciden.'
  }

  return { valido: Object.keys(errores).length === 0, errores }
}

export function validarFormularioLogin(email: string, password: string): ResultadoValidacion {
  const errores: Record<string, string> = {}

  const errorEmail = validarEmail(email)
  if (errorEmail) errores.email = errorEmail

  if (!password) errores.password = 'Ingresa tu contrasena.'

  return { valido: Object.keys(errores).length === 0, errores }
}