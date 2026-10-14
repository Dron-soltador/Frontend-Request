import { useCallback, useEffect, useId, useRef, useState } from 'react'

import { buscarDirecciones } from '../../servicios/geocodificacion'
import type { Sugerencia } from '../../servicios/geocodificacion'
import { Spinner } from '../ui/Spinner'

const RETARDO_BUSQUEDA_MS = 400
const LONGITUD_MINIMA = 3

export interface BuscadorDireccionProps {
  etiqueta: string
  placeholder: string
  valor: string
  onElegir: (sugerencia: Sugerencia) => void
  onError?: (mensaje: string) => void
  /** Marca el buscador activo para distinguirlo del otro en pantalla. */
  activo?: boolean
}

/**
 * Buscador de direcciones al estilo de un motor de mapas: se escribe y el mapa
 * ofrece coincidencias de OpenStreetMap. Al elegir una, el punto se coloca en
 * esa ubicacion.
 *
 * Accesibilidad: la lista es un `listbox` con navegacion por flechas, Enter y
 * Escape, y cada sugerencia anuncia su categoria mediante texto legible.
 */
export function BuscadorDireccion({
  etiqueta,
  placeholder,
  valor,
  onElegir,
  onError,
  activo = false,
}: BuscadorDireccionProps) {
  const [consulta, setConsulta] = useState(valor)
  const [sugerencias, setSugerencias] = useState<Sugerencia[]>([])
  const [abierto, setAbierto] = useState(false)
  const [buscando, setBuscando] = useState(false)
  const [indiceActivo, setIndiceActivo] = useState(-1)

  const idBase = useId()
  const listaId = `${idBase}-lista`
  const contenedor = useRef<HTMLDivElement>(null)
const abortar = useRef<AbortController | null>(null)
// Tras elegir una sugerencia el campo queda con la direccion completa. Si no
// marcamos ese caso, el efecto la vuelve a consultar y el desplegable se
// reabre solo sobre el mapa, tapando lo recien elegido.
const omitirBusqueda = useRef(false)

/**
 * `onError` llega del contexto de avisos y cambia de identidad cada vez que se
 * muestra un toast. Si fuera dependencia del efecto de busqueda, cada mensaje de
 * confirmacion dispararia una consulta nueva y reabriria el desplegable.
 */
const onErrorRef = useRef(onError)
onErrorRef.current = onError

  // Si el punto cambia desde afuera (por ejemplo al cargar una direccion guardada),
  // el campo se sincroniza.
  useEffect(() => {
    setConsulta(valor)
  }, [valor])

  useEffect(() => {
    const texto = consulta.trim()

    if (omitirBusqueda.current) {
      omitirBusqueda.current = false
      setSugerencias([])
      setAbierto(false)
      setBuscando(false)
      return
    }

    if (texto.length < LONGITUD_MINIMA) {
      setSugerencias([])
      setAbierto(false)
      setBuscando(false)
      return
    }

    setBuscando(true)
    const temporizador = setTimeout(async () => {
      abortar.current?.abort()
      const controlador = new AbortController()
      abortar.current = controlador

      try {
        const resultados = await buscarDirecciones(texto, controlador.signal)
        if (controlador.signal.aborted) return
        setSugerencias(resultados)
        setIndiceActivo(-1)
        setAbierto(resultados.length > 0)
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
        onErrorRef.current?.(error instanceof Error ? error.message : 'Error al buscar direcciones.')
      } finally {
        if (!controlador.signal.aborted) setBuscando(false)
      }
    }, RETARDO_BUSQUEDA_MS)

    return () => clearTimeout(temporizador)
  }, [consulta])

  // Cierra la lista al hacer clic fuera.
  useEffect(() => {
    function alHacerClicFuera(evento: MouseEvent) {
      if (!contenedor.current?.contains(evento.target as Node)) setAbierto(false)
    }
    document.addEventListener('mousedown', alHacerClicFuera)
    return () => document.removeEventListener('mousedown', alHacerClicFuera)
  }, [])

  const elegir = useCallback(
    (sugerencia: Sugerencia) => {
      omitirBusqueda.current = true
      setConsulta(sugerencia.direccion)
      setSugerencias([])
      setAbierto(false)
      setIndiceActivo(-1)
      onElegir(sugerencia)
    },
    [onElegir],
  )

  function manejarTeclado(evento: React.KeyboardEvent<HTMLInputElement>) {
    if (!abierto || sugerencias.length === 0) {
      if (evento.key === 'Escape') setAbierto(false)
      return
    }

    if (evento.key === 'ArrowDown') {
      evento.preventDefault()
      setIndiceActivo((previo) => (previo + 1) % sugerencias.length)
    } else if (evento.key === 'ArrowUp') {
      evento.preventDefault()
      setIndiceActivo((previo) => (previo <= 0 ? sugerencias.length - 1 : previo - 1))
    } else if (evento.key === 'Enter' && indiceActivo >= 0) {
      evento.preventDefault()
      elegir(sugerencias[indiceActivo])
    } else if (evento.key === 'Escape') {
      setAbierto(false)
    }
  }

  return (
    <div ref={contenedor} className="relative">
      <label htmlFor={`${idBase}-entrada`} className="campo-label">
        {etiqueta}
      </label>

      <div className="relative">
        <input
          id={`${idBase}-entrada`}
          type="search"
          role="combobox"
          autoComplete="off"
          aria-expanded={abierto}
          aria-controls={listaId}
          aria-autocomplete="list"
          aria-activedescendant={
            indiceActivo >= 0 ? `${idBase}-opcion-${indiceActivo}` : undefined
          }
          placeholder={placeholder}
          value={consulta}
          onChange={(evento) => {
            // Escribir a mano invalida la omision pendiente: si no, el siguiente
            // texto tecleado se tragaria la bandera.
            omitirBusqueda.current = false
            setConsulta(evento.target.value)
          }}
          onFocus={() => sugerencias.length > 0 && setAbierto(true)}
          onKeyDown={manejarTeclado}
          className={`campo-input pr-10 ${
            activo ? 'ring-2 ring-marca-600/25' : ''
          }`}
        />

        {buscando && (
          <span className="absolute inset-y-0 right-3 flex items-center text-marca-600">
            <Spinner />
          </span>
        )}
      </div>

      {abierto && (
        <ul
          id={listaId}
          role="listbox"
          aria-label={`Sugerencias para ${etiqueta}`}
          className="animacion-entrada absolute inset-x-0 top-full z-[700] mt-1 max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-xl"
        >
          {sugerencias.map((sugerencia, indice) => (
            <li key={sugerencia.id} role="none">
              <button
                type="button"
                id={`${idBase}-opcion-${indice}`}
                role="option"
                aria-selected={indice === indiceActivo}
                onMouseEnter={() => setIndiceActivo(indice)}
                onClick={() => elegir(sugerencia)}
                className={`flex w-full items-start gap-2.5 px-3.5 py-2.5 text-left transition ${
                  indice === indiceActivo ? 'bg-marca-50' : 'hover:bg-slate-50'
                }`}
              >
                <PuntoUbicacion />
                <span className="min-w-0">
                  <span className="block text-sm leading-snug text-slate-800">
                    {sugerencia.direccion}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-1 text-[11px] text-slate-500">
        Busqueda de direcciones por OpenStreetMap (Nominatim).
      </p>
    </div>
  )
}

function PuntoUbicacion() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={1.8}
      stroke="currentColor"
      className="mt-0.5 size-4 shrink-0 text-marca-600"
    >
      <path
        d="M12 21s7-5.686 7-11a7 7 0 1 0-14 0c0 5.314 7 11 7 11Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  )
}