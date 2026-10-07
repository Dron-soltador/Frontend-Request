import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { Campo } from '../componentes/formularios/Campo'
import { Spinner } from '../componentes/ui/Spinner'
import { validarFormularioLogin } from '../componentes/formularios/validacion'
import { useAvisos } from '../componentes/avisos/ProveedorAvisos'
import { ErrorApi } from '../servicios/clienteHttp'
import { useSesion } from '../sesion/SesionContext'
import { LayoutAutenticacion } from './LayoutAutenticacion'

export default function PaginaLogin() {
  const navegar = useNavigate()
  const ubicacion = useLocation()
  const { iniciarSesionUsuario } = useSesion()
  const { error: mostrarError, exito: mostrarExito } = useAvisos()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errores, setErrores] = useState<Record<string, string>>({})
  const [enviando, setEnviando] = useState(false)

  async function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()

    const validacion = validarFormularioLogin(email, password)
    setErrores(validacion.errores)
    if (!validacion.valido) return

    setEnviando(true)
    try {
      await iniciarSesionUsuario({ email: email.trim(), password })
      mostrarExito('Sesion iniciada correctamente.')
      // Si RutaProtegida nos.expulsó de una ruta privada, volvemos a ella.
      const destino = (ubicacion.state as { desde?: string } | null)?.desde ?? '/panel'
      navegar(destino, { replace: true })
    } catch (excepcion) {
      // El backend responde 401 con {"message": "Credenciales invalidas"} y 400 si
      // faltan campos. Mostramos su mensaje en un toast, como pide la issue.
      const mensaje =
        excepcion instanceof ErrorApi
          ? excepcion.message
          : 'Ocurrio un error inesperado al iniciar sesion.'
      mostrarError(mensaje)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <LayoutAutenticacion
      titulo="Inicia sesion en tu cuenta"
      descripcion="Accede al panel de cliente para solicitar y seguir tus entregas."
      pie={
        <>
          Todavia no tienes cuenta?{' '}
          <Link
            to="/registro"
            className="font-semibold text-marca-700 underline-offset-4 hover:underline"
          >
            Registrate
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
          autoComplete="current-password"
          placeholder="Tu contrasena"
          esSecreto
          value={password}
          onChange={(evento) => setPassword(evento.target.value)}
          error={errores.password}
          disabled={enviando}
          required
        />

        <button
          type="submit"
          disabled={enviando}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-marca-600 px-4 py-3
            text-sm font-semibold text-white shadow-sm transition
            hover:bg-marca-700 focus-visible:outline-marca-700
            disabled:cursor-not-allowed disabled:opacity-60"
        >
          {enviando && <Spinner />}
          {enviando ? 'Verificando credenciales...' : 'Entrar al panel'}
        </button>
      </form>
    </LayoutAutenticacion>
  )
}