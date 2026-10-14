import { useCallback, useEffect, useMemo, useState } from 'react'

import { BuscadorDireccion } from '../componentes/mapa/BuscadorDireccion'
import { SelectorPuntos } from '../componentes/mapa/SelectorPuntos'
import type { PuntoActivo } from '../componentes/mapa/SelectorPuntos'
import { formatearCoordenada } from '../componentes/mapa/geometria'
import type { Punto } from '../componentes/mapa/geometria'
import { useAvisos } from '../componentes/avisos/ProveedorAvisos'
import {
  eliminarDireccion,
  guardarDireccion,
  guardarSeleccion,
  leerSeleccion,
  listarGuardadas,
} from '../sesion/localizacion'
import type { DireccionGuardada, PuntoEtiquetado, Seleccion } from '../sesion/localizacion'

/**
 * Pantalla de definicion de puntos de entrega. El punto se puede fijar de tres
 * formas: escribiendo una direccion, arrastrando el marcador o haciendo clic en
 * el mapa. El formulario completo de solicitud (peso, categoria, urgencia y
 * cotizacion) llega en su issue.
 */
export default function PaginaPuntos() {
  const { exito, error } = useAvisos()

  const [origen, setOrigen] = useState<PuntoEtiquetado | null>(null)
  const [destino, setDestino] = useState<PuntoEtiquetado | null>(null)
  const [activo, setActivo] = useState<PuntoActivo>('origen')
  const [guardadas, setGuardadas] = useState<DireccionGuardada[]>([])
  const [nombre, setNombre] = useState('')

  // Recupera la localizacion y las direcciones guardadas al abrir la pantalla.
  useEffect(() => {
    const seleccion = leerSeleccion()
    setOrigen(seleccion.origen)
    setDestino(seleccion.destino)
    setGuardadas(listarGuardadas())
  }, [])

  // Persiste cada cambio para que un F5 no borre el trabajo del cliente.
  useEffect(() => {
    if (!origen && !destino) return
    const seleccion: Seleccion = { origen, destino }
    guardarSeleccion(seleccion)
  }, [origen, destino])

  const cambiarPunto = useCallback((clave: 'origen' | 'destino') => (nuevo: Punto) => {
    // Al mover un punto a mano se descarta la direccion anterior: ya no describe
    // la coordenada real y llevaria al dron a un lugar equivocado.
    const actualizado: PuntoEtiquetado = { punto: nuevo, direccion: '' }
    if (clave === 'origen') setOrigen(actualizado)
    else setDestino(actualizado)
  }, [])

  const elegirSugerencia = useCallback(
    (clave: 'origen' | 'destino') => (sugerencia: { direccion: string; punto: Punto }) => {
      const seleccionado: PuntoEtiquetado = {
        punto: sugerencia.punto,
        direccion: sugerencia.direccion,
      }
      if (clave === 'origen') setOrigen(seleccionado)
      else setDestino(seleccionado)

      // Tras fijar el destino conviene pasar a elegir el origen y no al reves.
      if (clave === 'destino') setActivo('origen')
    },
    [],
  )

  function guardarActual(nombre: string) {
    const fuente = activo === 'origen' ? origen : destino
    if (!fuente) return
    if (!nombre.trim()) {
      error('Escribe un nombre para identificar la direccion.')
      return
    }

    guardarDireccion(nombre.trim(), fuente.punto, fuente.direccion)
    setGuardadas(listarGuardadas())
    setNombre('')
    exito(`Direccion "${nombre.trim()}" guardada.`)
  }

  function usarGuardada(item: DireccionGuardada) {
    const seleccionado: PuntoEtiquetado = { punto: item.punto, direccion: item.direccion }
    if (activo === 'origen') setOrigen(seleccionado)
    else setDestino(seleccionado)
  }

  function borrarGuardada(id: string) {
    eliminarDireccion(id)
    setGuardadas(listarGuardadas())
  }

  const origenActivo = activo === 'origen'
  const puntoEnEdicion = origenActivo ? origen : destino

  return (
    <div className="flex min-h-dvh flex-col bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-4 sm:px-8">
          <h1 className="text-lg font-semibold text-marca-900">Definir puntos de entrega</h1>
          <p className="text-sm text-slate-600">
            Busca una direccion o arrastra los marcadores para fijar el origen y el destino.
          </p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 space-y-5 px-5 py-6 sm:px-8 sm:py-8">
        <SelectorPuntos
          origen={origen?.punto ?? null}
          destino={destino?.punto ?? null}
          activo={activo}
          onActivoChange={setActivo}
          onChange={(cambios) => {
            if (cambios.origen) cambiarPunto('origen')(cambios.origen)
            if (cambios.destino) cambiarPunto('destino')(cambios.destino)
          }}
          direccionOrigen={origen?.direccion || undefined}
          direccionDestino={destino?.direccion || undefined}
        />

        <div className="grid gap-5 lg:grid-cols-2">
          <BuscadorDireccion
            etiqueta="Direccion de origen (Punto A)"
            placeholder="Plaza de Mayo, Buenos Aires"
            activo={origenActivo}
            valor={origen?.direccion ?? ''}
            onElegir={elegirSugerencia('origen')}
            onError={error}
          />
          <BuscadorDireccion
            etiqueta="Direccion de destino (Punto B)"
            placeholder="Parque Centenario, Buenos Aires"
            activo={!origenActivo}
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
            vacio="Cambia a Punto B y repite la operacion."
          />
        </div>

        <ListaDirecciones
          guardadas={guardadas}
          nombre={nombre}
          onNombreChange={setNombre}
          hayPunto={puntoEnEdicion !== null}
          destinoActivo={origenActivo ? 'origen' : 'destino'}
          onGuardar={guardarActual}
          onUsar={usarGuardada}
          onBorrar={borrarGuardada}
        />
      </main>
    </div>
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
        <h2 className="font-semibold text-slate-900">{etiqueta}</h2>
      </div>

      {punto ? (
        <>
          {punto.direccion && (
            <p className="mt-3 text-sm leading-snug text-slate-700">{punto.direccion}</p>
          )}
          <dl className={`grid grid-cols-2 gap-2 font-mono text-xs ${punto.direccion ? 'mt-3' : 'mt-4'}`}>
            <div>
              <dt className="text-slate-500">Latitud</dt>
              <dd className="font-semibold text-slate-900">{formatearCoordenada(punto.punto.latitud)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Longitud</dt>
              <dd className="font-semibold text-slate-900">{formatearCoordenada(punto.punto.longitud)}</dd>
            </div>
          </dl>
        </>
      ) : (
        <p className="mt-3 text-sm text-slate-500">{vacio}</p>
      )}
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
  onGuardar: (nombre: string) => void
  onUsar: (item: DireccionGuardada) => void
  onBorrar: (id: string) => void
}) {
  const vacia = useMemo(() => guardadas.length === 0, [guardadas])

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-3.5">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Mis direcciones guardadas</h2>
          <p className="text-xs text-slate-500">
            Se conservan en este navegador para reutilizarlas en futuros envios.
          </p>
        </div>

        <form
          onSubmit={(evento) => {
            evento.preventDefault()
            onGuardar(nombre)
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
            className="rounded-lg bg-marca-600 px-3.5 py-1.5 text-sm font-semibold text-white transition hover:bg-marca-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Guardar {destinoActivo === 'origen' ? 'origen' : 'destino'}
          </button>
        </form>
      </div>

      {vacia ? (
        <p className="px-5 py-6 text-sm text-slate-500">
          Todavia no guardaste ninguna direccion. Fija un punto y dale un nombre.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {guardadas.map((item) => (
            <li key={item.id} className="flex items-center gap-3 px-5 py-3">
              <button
                type="button"
                onClick={() => onUsar(item)}
                className="min-w-0 flex-1 text-left"
              >
                <span className="block text-sm font-medium text-marca-800">{item.nombre}</span>
                <span className="block truncate text-xs text-slate-500">
                  {item.direccion || `${formatearCoordenada(item.punto.latitud)}, ${formatearCoordenada(item.punto.longitud)}`}
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