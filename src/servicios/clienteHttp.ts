/**
 * Cliente HTTP compartido por todos los microservicios.
 *
 * El frontend nunca hace fetch directo desde los componentes: pasa por aqui para
 * centralizar tres cosas que el README del proyecto exige.
 *   1. Timeouts: ninguna peticion puede quedar colgada y romper la demostracion.
 *   2. Errores homogeneos: se convierten en `ErrorApi` con mensaje de la API.
 *   3. Credenciales: se envia el JWT en Authorization cuando existe en sesion.
 */

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '')

/** Timeout por defecto. El objetivo del proyecto es responder en < 1500 ms. */
const TIMEOUT_POR_DEFECTO_MS = 10_000

const CLAVE_TOKEN = 'dronedesde.sesion'

export class ErrorApi extends Error {
  readonly estado: number

  constructor(mensaje: string, estado: number) {
    super(mensaje)
    this.name = 'ErrorApi'
    this.estado = estado
  }

  /** 400: el backend rechazo los datos enviados por el formulario. */
  get esValidacion(): boolean {
    return this.estado === 400 || this.estado === 422
  }

  /** 401: token ausente, vencido o credenciales incorrectas. */
  get esNoAutorizado(): boolean {
    return this.estado === 401
  }

  /** El backend no respondio o la peticion supero el timeout. */
  get esDeRed(): boolean {
    return this.estado === 0
  }
}

export interface OpcionesPeticion extends Omit<RequestInit, 'body'> {
  body?: unknown
  /** Timeout en milisegundos. */
  timeout?: number
}

export function guardarToken(token: string): void {
  localStorage.setItem(CLAVE_TOKEN, token)
}

export function leerToken(): string | null {
  return localStorage.getItem(CLAVE_TOKEN)
}

export function limpiarToken(): void {
  localStorage.removeItem(CLAVE_TOKEN)
}

function construirUrl(ruta: string): string {
  return `${BASE_URL}${ruta.startsWith('/') ? ruta : `/${ruta}`}`
}

function resolverToken(): string | null {
  return typeof localStorage === 'undefined' ? null : leerToken()
}

async function leerJsonSeguro(respuesta: Response): Promise<Record<string, unknown>> {
  try {
    const datos = await respuesta.json()
    return typeof datos === 'object' && datos !== null ? (datos as Record<string, unknown>) : {}
  } catch {
    // El backend puede devolver HTML (por ejemplo un 502 del proxy de Vite).
    return {}
  }
}

function extraerMensaje(datos: Record<string, unknown>, fallback: string): string {
  const candidatos = ['message', 'mensaje', 'error', 'detail']
  for (const clave of candidatos) {
    const valor = datos[clave]
    if (typeof valor === 'string' && valor.trim()) return valor.trim()
  }
  return fallback
}

/**
 * Ejecuta una peticion JSON contra la API y normaliza los errores.
 * @throws {ErrorApi} ante cualquier fallo de red, timeout o respuesta no 2xx.
 */
export async function peticion<T>(ruta: string, opciones: OpcionesPeticion = {}): Promise<T> {
  const { body, timeout = TIMEOUT_POR_DEFECTO_MS, headers, ...resto } = opciones
  const controlador = new AbortController()
  const temporizador = setTimeout(() => controlador.abort(), timeout)

  let respuesta: Response
  try {
    respuesta = await fetch(construirUrl(ruta), {
      ...resto,
      signal: controlador.signal,
      headers: {
        Accept: 'application/json',
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...(resolverToken() ? { Authorization: `Bearer ${resolverToken()}` } : {}),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ErrorApi('El servidor tardo demasiado en responder. Intenta de nuevo.', 0)
    }
    throw new ErrorApi(
      'No se pudo conectar con el servidor de entregas. Revisa que el backend este levantado.',
      0,
    )
  } finally {
    clearTimeout(temporizador)
  }

  const datos = await leerJsonSeguro(respuesta)

  if (!respuesta.ok) {
    const predeterminado = `El servidor respondio con codigo ${respuesta.status}. Intenta de nuevo.`
    throw new ErrorApi(extraerMensaje(datos, predeterminado), respuesta.status)
  }

  return datos as T
}