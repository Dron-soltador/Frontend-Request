import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { Campo } from '../componentes/formularios/Campo'
import { validarFormularioRegistro } from '../componentes/formularios/validacion'
import { Spinner } from '../componentes/ui/Spinner'
import { useAvisos } from '../componentes/avisos/ProveedorAvisos'
import { ErrorApi } from '../servicios/clienteHttp'
import { useSesion } from '../sesion/SesionContext'
import { LayoutAutenticacion } from './LayoutAutenticacion'

export default function PaginaRegistro() {
  const navegar = useNavigate()
  const { registrarUsuario } = useSesion()
  const { error: mostrarError, exito: mostrarExito } = useAvisos()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmacion, setConfirmacion] = useState('')
  const [aceptaTerminos, setAceptaTerminos] = useState(false)
  const [errores, setErrores] = useState<Record<string, string>>({})
  const [enviando, setEnviando] = useState(false)

  async function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()

    const validacion = validarFormularioRegistro(email, password, confirmacion)
    if (!aceptaTerminos) {
      validacion.errores.terminos = 'Debes aceptar los terminos para crear la cuenta.'
      validacion.valido = false
    }

    setErrores(validacion.errores)
    if (!validacion.valido) return

    setEnviando(true)
    try {
      const mensaje = await registrarUsuario({ email: email.trim(), password })
      mostrarExito(mensaje || 'Cuenta creada. Bienvenido a DroneExpress.')
      navegar('/panel', { replace: true })
    } catch (excepcion) {
      // 400 "El usuario ya existe" o "Email y contrasena son requeridos".
      const mensaje =
        excepcion instanceof ErrorApi
          ? excepcion.message
          : 'Ocurrio un error inesperado al crear la cuenta.'
      mostrarError(mensaje)

      // Si el conflicto es de email lo mostramos bajo el campo y no solo en el toast.
      if (excepcion instanceof ErrorApi && /existe/i.test(excepcion.message)) {
        setErrores({ email: excepcion.message })
      }
    } finally {
      setEnviando(false)
    }
  }

  return (
    <LayoutAutenticacion
      titulo="Crea tu cuenta de cliente"
      descripcion="Registrate para cotizar y solicitar entregas con drones. El registro toma unos segundos."
      pie={
        <>
          Ya tienes cuenta?{' '}
          <Link
            to="/login"
            className="font-semibold text-marca-700 underline-offset-4 hover:underline"
          >
            Inicia sesion
          </Link>
        </>
      }
    >
      <form onSubmit={manejarEnvio} noValidate className="space-y-5">
        <Campo
          etiqueta="Correo electronico"
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          placeholder="cliente@ejemplo.com"
          ayuda="Sera tu identificador para acceder y para recibir el seguimiento."
          value={email}
          onChange={(evento) => setEmail(evento.target.value)}
          error={errores.email}
          disabled={enviando}
          required
        />

        <Campo
          etiqueta="Contrasena"
          type="password"
          name="password"
          autoComplete="new-password"
          placeholder="Minimo 8 caracteres"
          esSecreto
          ayuda="El backend la almacena cifrada con Argon2."
          value={password}
          onChange={(evento) => setPassword(evento.target.value)}
          error={errores.password}
          disabled={enviando}
          required
        />

        <Campo
          etiqueta="Repetir contrasena"
          type="password"
          name="confirmacion"
          autoComplete="new-password"
          placeholder="Repite la contrasena"
          esSecreto
          value={confirmacion}
          onChange={(evento) => setConfirmacion(evento.target.value)}
          error={errores.confirmacion}
          disabled={enviando}
          required
        />

        <div className="space-y-1.5">
          <label className="flex items-start gap-3 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={aceptaTerminos}
              onChange={(evento) => setAceptaTerminos(evento.target.checked)}
              disabled={enviando}
              className="mt-0.5 size-4 rounded border-slate-300 text-marca-600 focus:ring-marca-600/30"
              aria-describedby={errores.terminos ? 'error-terminos' : undefined}
            />
            <span>
              Acepto las condiciones del servicio y el tratamiento de mis datos para gestionar
              mis entregas.
            </span>
          </label>
          {errores.terminos && (
            <p id="error-terminos" className="text-xs font-medium text-red-600">
              {errores.terminos}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={enviando}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-marca-600 px-4 py-3
            text-sm font-semibold text-white shadow-sm transition
            hover:bg-marca-700 focus-visible:outline-marca-700
            disabled:cursor-not-allowed disabled:opacity-60"
        >
          {enviando && <Spinner />}
          {enviando ? 'Creando tu cuenta...' : 'Crear cuenta'}
        </button>
      </form>
    </LayoutAutenticacion>
  )
}