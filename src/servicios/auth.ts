import { peticion } from './clienteHttp'

/** Respuesta de POST /auth/login (microservicio de Pedidos). */
export interface RespuestaLogin {
  message: string
  token: string
  rol: string
}

/** Respuesta de POST /auth/register. */
export interface RespuestaRegistro {
  message: string
  usuario: {
    id: number
    email: string
    rol: string
  }
}

export interface Credenciales {
  email: string
  password: string
}

/** Registra un cliente nuevo. El backend responde 400 si el email ya existe. */
export function registrar(credenciales: Credenciales): Promise<RespuestaRegistro> {
  return peticion<RespuestaRegistro>('/auth/register', {
    method: 'POST',
    body: { ...credenciales, rol: 'cliente' },
  })
}

/** Autentica al usuario. Responde 401 si las credenciales no coinciden. */
export function iniciarSesion(credenciales: Credenciales): Promise<RespuestaLogin> {
  return peticion<RespuestaLogin>('/auth/login', {
    method: 'POST',
    body: credenciales,
  })
}