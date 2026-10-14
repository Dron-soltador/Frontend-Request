import { useCallback, useEffect, useMemo, useState } from 'react'

import { BuscadorDireccion } from '../componentes/mapa/BuscadorDireccion'
import { SelectorPuntos } from '../componentes/mapa/SelectorPuntos'
import type { PuntoActivo } from '../componentes/mapa/SelectorPuntos'
import { formatearCoordenada } from '../componentes/mapa/geometria'
import type { Punto } from '../componentes/mapa/geometria'
import { useAvisos } from '../componentes/avisos/ProveedorAvisos'
import { PanelCotizacion } from '../componentes/paquete/PanelCotizacion'
import { FormularioPaquete } from '../componentes/paquete/FormularioPaquete'
import type { DatosPaquete } from '../componentes/paquete/FormularioPaquete'
import { esFragil } from '../componentes/paquete/FormularioPaquete'
import { claveCotizacion, useCotizacion } from '../componentes/paquete/useCotizacion'
import { crearPedido } from '../servicios/pedidos'
import type { DatosCotizacion, PedidoRegistrado } from '../servicios/pedidos'
import { ErrorApi } from '../servicios/clienteHttp'
import {
  guardarBorrador,
  hayCambiosSinGuardar,
  leerBorrador,
  limpiarBorrador,
  tiempoRelativo,
} from '../sesion/borrador'
import type { BorradorPedido } from '../sesion/borrador'
import {
  eliminarDireccion,
  guardarDireccion,
  listarGuardadas,
} from '../sesion/localizacion'
import type { DireccionGuardada, PuntoEtiquetado } from '../sesion/localizacion'
import { useSesion } from '../sesion/SesionContext'

const PAQUETE_VACIO: DatosPaquete = {
  peso_kg: 0,
  fecha_programada: '',
  categoria: 'Estandar',
  es_urgente: false,
  descripcion: '',
}

/**
 * Seccion unica de solicitud. Reune en una sola pantalla todo el flujo del
 * pedido, sin fragmentarlo en modulos sueltos.
 *
 * Paso 1: puntos de entrega en el mapa. Paso 2: datos del paquete con cotizacion
 * en vivo contra `POST /api/v1/pedidos/cotizar`. Paso 3: envio con
 * `POST /api/v1/pedidos`, que ademas notifica al despachador del administrador.
 */
export default function PaginaPedido() {
  const { exito, info, error } = useAvisos()
  const { email } = useSesion()

  const [origen, setOrigen] = useState<PuntoEtiquetado | null>(null)
  const [destino, setDestino] = useState<PuntoEtiquetado | null>(null)
  const [activo, setActivo] = useState<PuntoActivo>('origen')
  const [borrador, setBorrador] = useState<BorradorPedido | null>(null)
  const [guardadas, setGuardadas] = useState<DireccionGuardada[]>([])
  const [nombre, setNombre] = useState('')
  const [paquete, setPaquete] = useState<DatosPaquete>(PAQUETE_VACIO)
  const [erroresPaquete, setErroresPaquete] = useState<
    Partial<Record<keyof DatosPaquete, string>>
  >({})
  const [enviando, setEnviando] = useState(false)
  const [ultimoPedido, setUltimoPedido] = useState<{
    id: number
    costo: number | null
    notificado: boolean
  } | null>(null)
  // Sube cada vez que los puntos cambian sin pasar por un clic, para que el mapa
  // se desplace a la nueva ubicacion.
  const [revisionEncuadre, setRevisionEncuadre] = useState(0)
  const reencuadrar = useCallback(() => setRevisionEncuadre((n) => n + 1), [])

  // Al abrir la pantalla se recupera lo que quedo a medias: el borrador que el
  // cliente guardo y sus direcciones habituales. Sin borrador no se restaura
  // nada: el guardado es una accion explicita del usuario, no un autoguardado.
  useEffect(() => {
    const guardado = leerBorrador()
    setBorrador(guardado)
    if (guardado) {
      setOrigen(guardado.origen)
      setDestino(guardado.destino)
      reencuadrar()
    }
    setGuardadas(listarGuardadas())
  }, [reencuadrar])

  const moverPunto = useCallback((clave: 'origen' | 'destino') => (nuevo: Punto) => {
    // Al mover un punto a mano se descarta su direccion: la etiqueta dejaria de
    // describir la coordenada real y llevaria al dron al lugar equivocado.
    const actualizado: PuntoEtiquetado = { punto: nuevo, direccion: '' }
    if (clave === 'origen') setOrigen(actualizado)
    else setDestino(actualizado)
  }, [])

  const elegirSugerencia = useCallback(
    (clave: 'origen' | 'destino') => (sugerencia: { direccion: string; punto: Punto }) => {
      const seleccionado: PuntoEtiquetado = { punto: sugerencia.punto, direccion: sugerencia.direccion }
      if (clave === 'origen') setOrigen(seleccionado)
      else setDestino(seleccionado)
      reencuadrar()
    },
    [reencuadrar],
  )

  function guardar() {
    if (!origen || !destino) {
      error('Completa el origen y el destino antes de guardar el pedido.')
      return
    }
    setBorrador(guardarBorrador(origen, destino))
    exito('Pedido guardado en tu sesion. Podras continuar completandolo mas tarde.')
  }

  function descartar() {
    limpiarBorrador()
    setBorrador(null)
    setOrigen(null)
    setDestino(null)
    setActivo('origen')
    info('Borrador descartado y formulario reiniciado.')
  }

  function guardarDireccionActual() {
    const fuente = activo === 'origen' ? origen : destino
    if (!fuente) return
    if (!nombre.trim()) {
      error('Escribe un nombre para identificar la direccion.')
      return
    }
    guardarDireccion(nombre.trim(), fuente.punto, fuente.direccion)
    setGuardadas(listarGuardadas())
    setNombre('')
    exito(`Direccion "${nombre.trim()}" guardada para futuros envios.`)
  }

  const sinGuardar = hayCambiosSinGuardar(borrador, origen, destino)

  /**
   * Datos que se envian a `POST /api/v1/pedidos/cotizar`. Se anula mientras falte
   * el peso o los puntos, para no pedir una tarifa que el backend va a rechazar.
   */
  const datosCotizacion = useMemo<DatosCotizacion | null>(() => {
    if (!origen || !destino || paquete.peso_kg <= 0) return null
    return {
      peso_kg: paquete.peso_kg,
      origen: origen.punto,
      destino: destino.punto,
      es_fragil: esFragil(paquete.categoria),
      es_urgente: paquete.es_urgente,
    }
  }, [origen, destino, paquete.peso_kg, paquete.categoria, paquete.es_urgente])

  const cotizacion = useCotizacion(claveCotizacion(datosCotizacion), datosCotizacion)

  const cambiarPaquete = useCallback(
    <K extends keyof DatosPaquete>(campo: K, valor: DatosPaquete[K]) => {
      setPaquete((previo) => ({ ...previo, [campo]: valor }))
      setErroresPaquete((previos) => ({ ...previos, [campo]: undefined }))
    },
    [],
  )

  function validarPaquete(): boolean {
    const errores: Partial<Record<keyof DatosPaquete, string>> = {}

    if (!(paquete.peso_kg > 0)) {
      errores.peso_kg = 'Ingresa el peso del paquete.'
    } else if (paquete.peso_kg > 50) {
      errores.peso_kg = 'El peso maximo por paquete es 50 kg.'
    }

    if (!paquete.fecha_programada) {
      errores.fecha_programada = 'Elige la fecha de entrega.'
    }

    setErroresPaquete(errores)
    return Object.keys(errores).length === 0
  }

  async function enviar() {
    if (!origen || !destino) {
      error('Define el origen y el destino antes de solicitar el envio.')
      return
    }
    if (!validarPaquete()) {
      error('Revisa los campos marcados antes de solicitar el envio.')
      return
    }
    if (cotizacion.estado !== 'lista') {
      error('Espera a que termine la cotizacion antes de enviar.')
      return
    }

    setEnviando(true)
    try {
      const respuesta = await crearPedido({
        peso_kg: paquete.peso_kg,
        origen: origen.punto,
        destino: destino.punto,
        es_fragil: esFragil(paquete.categoria),
        es_urgente: paquete.es_urgente,
        // El backend exige `cliente` y `direccion`. El cliente es la cuenta
        // autenticada y la direccion, el destino elegido en el mapa.
        cliente: email ?? 'Cliente',
        direccion: destino.direccion || 'Punto definido en el mapa',
        categoria: paquete.categoria,
        fecha_programada: paquete.fecha_programada,
        descripcion: paquete.descripcion,
        costo_total: cotizacion.estado === 'lista' ? cotizacion.cotizacion.costo_total : 0,
      })

      setUltimoPedido({
        id: respuesta.pedido.id,
        costo: respuesta.pedido.costo_total,
        notificado: true,
      })
      exito(`Pedido #${respuesta.pedido.id} registrado. Estado: ${respuesta.pedido.estado}.`)
      limpiarFormulario()
    } catch (excepcion) {
      /**
       * 502 no es un fallo del cliente: el backend confirma que guardo el
       * pedido y solo no logro avisar al despachador del administrador. Tratarlo
       * como error dejaria al cliente creyendo que no se registro nada cuando si
       * esta en la base de datos, y duplicaria el pedido al reintentar.
       */
      const parcial = excepcion instanceof ErrorApi ? leerPedidoParcial(excepcion) : null

      if (parcial) {
        setUltimoPedido({
          id: parcial.id,
          costo: parcial.costo_total,
          notificado: false,
        })
        info(
          `Pedido #${parcial.id} registrado, pero el despachador no respondio a tiempo. Queda pendiente de asignacion.`,
        )
        limpiarFormulario()
        return
      }

      error(
        excepcion instanceof ErrorApi
          ? excepcion.message
          : 'No se pudo registrar el pedido. Intenta de nuevo.',
      )
    } finally {
      setEnviando(false)
    }
  }

  /** Limpia el formulario tras un envio exitoso, como pide el criterio de aceptacion. */
  function limpiarFormulario() {
    setOrigen(null)
    setDestino(null)
    setActivo('origen')
    setPaquete(PAQUETE_VACIO)
    setErroresPaquete({})
    setBorrador(null)
    limpiarBorrador()
    reencuadrar()
  }

  const puedeEnviar =
    Boolean(origen && destino) &&
    paquete.peso_kg > 0 &&
    paquete.fecha_programada !== '' &&
    cotizacion.estado === 'lista' &&
    !enviando

  return (
    <div className="flex min-h-dvh flex-col bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-5 sm:px-8">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Hacer un pedido</h1>
          <p className="mt-0.5 text-sm text-slate-600">
            Define los puntos de entrega, cargua los datos del paquete y mira la tarifa antes de
            confirmar.
          </p>

          <ol className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
            <Paso numero={1} titulo="Puntos de entrega" estado="activo" />
            <Separador />
            <Paso numero={2} titulo="Datos del paquete" estado="activo" />
            <Separador />
            <Paso numero={3} titulo="Confirmar y enviar" estado={puedeEnviar ? 'activo' : 'pendiente'} />
          </ol>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 space-y-5 px-5 py-6 sm:px-8 sm:py-8">
        <EstadoBorrador
          borrador={borrador}
          sinGuardar={sinGuardar}
          completo={Boolean(origen && destino)}
          onGuardar={guardar}
          onDescartar={descartar}
        />

        {ultimoPedido && (
          <ConfirmacionPedido
            id={ultimoPedido.id}
            costo={ultimoPedido.costo}
            notificado={ultimoPedido.notificado}
          />
        )}

        <SelectorPuntos
          origen={origen?.punto ?? null}
          destino={destino?.punto ?? null}
          activo={activo}
          onActivoChange={setActivo}
          onChange={(cambios) => {
            if (cambios.origen) moverPunto('origen')(cambios.origen)
            if (cambios.destino) moverPunto('destino')(cambios.destino)
          }}
          direccionOrigen={origen?.direccion || undefined}
          direccionDestino={destino?.direccion || undefined}
          revisionEncuadre={revisionEncuadre}
        />

        <div className="grid gap-5 lg:grid-cols-2">
          <BuscadorDireccion
            etiqueta="Direccion de origen (Punto A)"
            placeholder="Plaza de Mayo, Buenos Aires"
            activo={activo === 'origen'}
            valor={origen?.direccion ?? ''}
            onElegir={elegirSugerencia('origen')}
            onError={error}
          />
          <BuscadorDireccion
            etiqueta="Direccion de destino (Punto B)"
            placeholder="Parque Centenario, Buenos Aires"
            activo={activo === 'destino'}
            valor={destino?.direccion ?? ''}
            onElegir={elegirSugerencia('destino')}
            onError={error}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <TarjetaPunto
            etiqueta="Punto A (origen)"
            punto={origen}
            color="bg-emerald-600"
            vacio="Busca una direccion, haz clic en el mapa o arrastra el marcador verde."
          />
          <TarjetaPunto
            etiqueta="Punto B (destino)"
            punto={destino}
            color="bg-red-600"
            vacio="Marca el punto B en el mapa para completar el envio."
          />
        </div>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Datos del paquete</h2>
          <p className="mt-0.5 text-sm text-slate-600">
            Al cambiar el peso, la categoria o la urgencia se recalcula la tarifa.
          </p>

          <div className="mt-5 grid gap-6 lg:grid-cols-2">
            <FormularioPaquete
              datos={paquete}
              onChange={cambiarPaquete}
              errores={erroresPaquete}
              deshabilitado={enviando}
              onEnviar={enviar}
              puedeEnviar={puedeEnviar}
            />
            <PanelCotizacion estado={cotizacion} />
          </div>
        </section>

        <ListaDirecciones
          guardadas={guardadas}
          nombre={nombre}
          onNombreChange={setNombre}
          hayPunto={activo === 'origen' ? origen !== null : destino !== null}
          destinoActivo={activo === 'origen' ? 'origen' : 'destino'}
          onGuardar={guardarDireccionActual}
          onUsar={(item) => {
            const seleccionado: PuntoEtiquetado = { punto: item.punto, direccion: item.direccion }
            if (activo === 'origen') setOrigen(seleccionado)
            else setDestino(seleccionado)
            reencuadrar()
          }}
          onBorrar={(id) => {
            eliminarDireccion(id)
            setGuardadas(listarGuardadas())
          }}
        />

      </main>
    </div>
  )
}

function Paso({ numero, titulo, estado }: { numero: number; titulo: string; estado: 'activo' | 'pendiente' }) {
  const activo = estado === 'activo'
  return (
    <li className="flex items-center gap-1.5">
      <span
        className={`flex size-5 items-center justify-center rounded-full text-[11px] font-bold ${
          activo ? 'bg-marca-600 text-white' : 'bg-slate-200 text-slate-500'
        }`}
      >
        {numero}
      </span>
      <span className={activo ? 'font-semibold text-marca-800' : 'text-slate-500'}>{titulo}</span>
    </li>
  )
}

function Separador() {
  return (
    <li aria-hidden="true" className="text-slate-300">
      /
    </li>
  )
}

function EstadoBorrador({
  borrador,
  sinGuardar,
  completo,
  onGuardar,
  onDescartar,
}: {
  borrador: BorradorPedido | null
  sinGuardar: boolean
  completo: boolean
  onGuardar: () => void
  onDescartar: () => void
}) {
  const hayBorrador = borrador !== null

  return (
    <section
      className={`rounded-xl border p-4 sm:p-5 ${
        !completo
          ? 'border-slate-200 bg-white'
          : sinGuardar
            ? 'border-amber-300 bg-amber-50'
            : 'border-emerald-300 bg-emerald-50'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <IconoEstado sinGuardar={sinGuardar} hayBorrador={hayBorrador} />
            {!completo
              ? 'Pedido incompleto'
              : sinGuardar
                ? 'Cambios sin guardar'
                : 'Pedido guardado en tu sesion'}
          </h2>
          <p className="mt-1 text-xs text-slate-600">
            {!completo
              ? 'Falta definir el origen o el destino.'
              : sinGuardar
                ? 'Los puntos ya no coinciden con el borrador guardado.'
                : `Borrador guardado ${tiempoRelativo(borrador!.guardadoEn)}. Se conserva al salir de esta seccion.`}
          </p>
        </div>

        <div className="flex shrink-0 gap-2">
          {hayBorrador && (
            <button
              type="button"
              onClick={onDescartar}
              className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Descartar
            </button>
          )}
          <button
            type="button"
            onClick={onGuardar}
            disabled={!completo || !sinGuardar}
            className="inline-flex items-center gap-2 rounded-lg bg-marca-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-marca-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <IconoGuardar />
            Guardar pedido
          </button>
        </div>
      </div>
    </section>
  )
}

function IconoEstado({ sinGuardar, hayBorrador }: { sinGuardar: boolean; hayBorrador: boolean }) {
  const color = sinGuardar ? 'text-amber-600' : 'text-emerald-600'
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={2}
      stroke="currentColor"
      className={`size-5 shrink-0 ${color}`}
    >
      {sinGuardar ? (
        <path
          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {hayBorrador && sinGuardar && <path d="M0 0" />}
    </svg>
  )
}

function IconoGuardar() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={2}
      stroke="currentColor"
      className="size-4"
    >
      <path
        d="M9 3.75H6.75A2.25 2.25 0 0 0 4.5 6v13.5A2.25 2.25 0 0 0 6.75 21.75h10.5A2.25 2.25 0 0 0 19.5 18.75V8.31a2.25 2.25 0 0 0-.66-1.59l-3.07-3.07a2.25 2.25 0 0 0-1.59-.66H9.75M9 3.75c.38 0 .74.15 1.01.42l2.56 2.56a1.5 1.5 0 0 1 .43 1.06V6.75A2.25 2.25 0 0 1 10.75 9H9.75a2.25 2.25 0 0 1-2.25-2.25V5.25c0-.6.24-1.17.66-1.59L9 3.75Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function TarjetaPunto({
  etiqueta,
  punto,
  color,
  vacio,
}: {
  etiqueta: string
  punto: PuntoEtiquetado | null
  color: string
  vacio: string
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2.5">
        <span
          className={`flex size-6 items-center justify-center rounded-full ${color} text-xs font-bold text-white`}
        >
          {etiqueta.charAt(6)}
        </span>
        <h3 className="font-semibold text-slate-900">{etiqueta}</h3>
      </div>

      {punto ? (
        <>
          {punto.direccion && (
            <p className="mt-3 text-sm leading-snug text-slate-700">{punto.direccion}</p>
          )}
          <dl
            className={`grid grid-cols-2 gap-2 font-mono text-xs ${punto.direccion ? 'mt-3' : 'mt-4'}`}
          >
            <div>
              <dt className="text-slate-500">Latitud</dt>
              <dd className="font-semibold text-slate-900">
                {formatearCoordenada(punto.punto.latitud)}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Longitud</dt>
              <dd className="font-semibold text-slate-900">
                {formatearCoordenada(punto.punto.longitud)}
              </dd>
            </div>
          </dl>
        </>
      ) : (
        <p className="mt-3 text-sm text-slate-500">{vacio}</p>
      )}
    </section>
  )
}

/**
 * Confirmacion visible tras un envio exitoso. El criterio de aceptacion pide
 * limpiar el formulario y mostrar un mensaje: el formulario ya se limpio y este
 * bloque es el mensaje persistente (el toast se va solo a los 5 segundos).
 *
 * Distingue si el despachador recibio la notificacion, porque el backend puede
 * guardar el pedido y aun asi no logro avisar al administrador.
 */
function ConfirmacionPedido({
  id,
  costo,
  notificado,
}: {
  id: number
  costo: number | null
  notificado: boolean
}) {
  return (
    <section
      className={`rounded-xl border p-5 ${
        notificado ? 'border-emerald-300 bg-emerald-50' : 'border-amber-300 bg-amber-50'
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`flex size-9 shrink-0 items-center justify-center rounded-full text-white ${
            notificado ? 'bg-emerald-600' : 'bg-amber-600'
          }`}
        >
          {notificado ? (
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth={2.2}
              stroke="currentColor"
              className="size-5"
            >
              <path d="m4.5 12.75 6 6 9-13.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth={2}
              stroke="currentColor"
              className="size-5"
            >
              <path
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>

        <div>
          <h2
            className={`text-sm font-semibold ${
              notificado ? 'text-emerald-900' : 'text-amber-900'
            }`}
          >
            Pedido #{id} registrado correctamente
          </h2>
          <p className={`mt-1 text-sm ${notificado ? 'text-emerald-800' : 'text-amber-800'}`}>
            {notificado
              ? 'El despachador recibio la solicitud y buscara un dron disponible. Tu pedido quedo en estado PENDIENTE.'
              : 'Tu pedido quedo en estado PENDIENTE, pero el despachador no respondio a tiempo. Quedara pendiente de asignacion hasta que se le avise.'}
            {costo != null && ` Costo registrado: $${costo.toLocaleString('es-AR')}.`}
          </p>
          <p className={`mt-1 text-xs ${notificado ? 'text-emerald-700' : 'text-amber-700'}`}>
            El formulario se limpio para que puedas cargar un nuevo envio.
          </p>
        </div>
      </div>
    </section>
  )
}

/**
 * Extrae el pedido de un 502. El backend lo incluye en el cuerpo porque el
 * commit ya se hizo: lo que fallo fue unicamente la notificacion al despachador.
 */
function leerPedidoParcial(excepcion: ErrorApi): PedidoRegistrado | null {
  if (excepcion.estado !== 502) return null
  const cuerpo = excepcion.datos as { pedido?: PedidoRegistrado } | null
  return cuerpo?.pedido && typeof cuerpo.pedido.id === 'number' ? cuerpo.pedido : null
}

function ListaDirecciones({
  guardadas,
  nombre,
  onNombreChange,
  hayPunto,
  destinoActivo,
  onGuardar,
  onUsar,
  onBorrar,
}: {
  guardadas: DireccionGuardada[]
  nombre: string
  onNombreChange: (valor: string) => void
  hayPunto: boolean
  destinoActivo: 'origen' | 'destino'
  onGuardar: () => void
  onUsar: (item: DireccionGuardada) => void
  onBorrar: (id: string) => void
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-3.5">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Mis direcciones guardadas</h2>
          <p className="text-xs text-slate-500">
            Direcciones que reutilizas en futuros envios.
          </p>
        </div>

        <form
          onSubmit={(evento) => {
            evento.preventDefault()
            onGuardar()
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={nombre}
            onChange={(evento) => onNombreChange(evento.target.value)}
            placeholder="Ej: Casa, Oficina"
            aria-label="Nombre de la direccion a guardar"
            maxLength={40}
            className="campo-input w-40 py-1.5 text-sm"
          />
          <button
            type="submit"
            disabled={!hayPunto || !nombre.trim()}
            className="rounded-lg border border-marca-600 px-3.5 py-1.5 text-sm font-semibold text-marca-700 transition hover:bg-marca-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Guardar {destinoActivo === 'origen' ? 'origen' : 'destino'}
          </button>
        </form>
      </div>

      {guardadas.length === 0 ? (
        <p className="px-5 py-6 text-sm text-slate-500">
          Todavia no guardaste ninguna direccion. Fija un punto y dale un nombre.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {guardadas.map((item) => (
            <li key={item.id} className="flex items-center gap-3 px-5 py-3">
              <button type="button" onClick={() => onUsar(item)} className="min-w-0 flex-1 text-left">
                <span className="block text-sm font-medium text-marca-800">{item.nombre}</span>
                <span className="block truncate text-xs text-slate-500">
                  {item.direccion ||
                    `${formatearCoordenada(item.punto.latitud)}, ${formatearCoordenada(item.punto.longitud)}`}
                </span>
              </button>

              <span className="hidden shrink-0 font-mono text-[11px] text-slate-400 sm:inline">
                {formatearCoordenada(item.punto.latitud)}, {formatearCoordenada(item.punto.longitud)}
              </span>

              <button
                type="button"
                onClick={() => onBorrar(item.id)}
                aria-label={`Eliminar ${item.nombre}`}
                className="shrink-0 rounded p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="size-4"
                >
                  <path d="M6 18 18 6M6 6l12 12" strokeLinecap="round" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
