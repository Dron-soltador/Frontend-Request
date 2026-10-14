import { useCallback, useEffect, useState } from 'react'

import { BuscadorDireccion } from '../componentes/mapa/BuscadorDireccion'
import { SelectorPuntos } from '../componentes/mapa/SelectorPuntos'
import type { PuntoActivo } from '../componentes/mapa/SelectorPuntos'
import { formatearCoordenada } from '../componentes/mapa/geometria'
import type { Punto } from '../componentes/mapa/geometria'
import { useAvisos } from '../componentes/avisos/ProveedorAvisos'
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

/**
 * Seccion unica de solicitud. Reune en una sola pantalla todo el flujo del
 * pedido, sin fragmentarlo en modulos sueltos.
 *
 * Hoy solo esta habilitado el paso 1 (puntos de entrega). Los pasos 2 y 3
 * aparecen marcados como pendientes para que se vea el recorrido completo, que
 * es lo que se defendera en la exposicion.
 */
export default function PaginaPedido() {
  const { exito, info, error } = useAvisos()

  const [origen, setOrigen] = useState<PuntoEtiquetado | null>(null)
  const [destino, setDestino] = useState<PuntoEtiquetado | null>(null)
  const [activo, setActivo] = useState<PuntoActivo>('origen')
  const [borrador, setBorrador] = useState<BorradorPedido | null>(null)
  const [guardadas, setGuardadas] = useState<DireccionGuardada[]>([])
  const [nombre, setNombre] = useState('')
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

  return (
    <div className="flex min-h-dvh flex-col bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-5 sm:px-8">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Hacer un pedido</h1>
          <p className="mt-0.5 text-sm text-slate-600">
            Completa la solicitud de envio. Por ahora solo se piden los puntos de entrega.
          </p>

          <ol className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
            <Paso numero={1} titulo="Puntos de entrega" estado="activo" />
            <Separador />
            <Paso numero={2} titulo="Datos del paquete" estado="pendiente" />
            <Separador />
            <Paso numero={3} titulo="Confirmar y enviar" estado="pendiente" />
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

        <EnviarPedido listo={Boolean(origen && destino)} />
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

function EnviarPedido({ listo }: { listo: boolean }) {
  return (
    <section className="rounded-xl border border-dashed border-slate-300 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Enviar pedido</h2>
          <p className="mt-1 text-xs text-slate-600">
            Se habilita cuando esten completos el peso, la categoria y la fecha de entrega. Esos
            campos llegan con la issue del formulario de solicitud.
          </p>
        </div>
        <button
          type="button"
          disabled
          className="shrink-0 rounded-lg bg-slate-300 px-4 py-2 text-sm font-semibold text-white"
        >
          {listo ? 'Completa los datos del paquete' : 'Incompleto'}
        </button>
      </div>
    </section>
  )
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
