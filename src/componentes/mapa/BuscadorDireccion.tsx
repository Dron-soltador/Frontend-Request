import { useId } from 'react'

import type { Sugerencia } from '../../services/geocodificacion'
import { useBuscadorDirecciones } from '../../hooks/useBuscadorDirecciones'
import { Spinner } from '../ui/Spinner'
import { ListaSugerencias } from './ListaSugerencias'

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
  const idBase = useId()
  const listaId = `${idBase}-lista`
  const {
    contenedor,
    consulta,
    sugerencias,
    abierto,
    buscando,
    indiceActivo,
    setIndiceActivo,
    elegir,
    escribir,
    manejarTeclado,
    alEnfocar,
  } = useBuscadorDirecciones({ valor, onElegir, onError })

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
            indiceActivo >= 0 ? `${listaId}-opcion-${indiceActivo}` : undefined
          }
          placeholder={placeholder}
          value={consulta}
          onChange={(evento) => escribir(evento.target.value)}
          onFocus={alEnfocar}
          onKeyDown={manejarTeclado}
          className={`campo-input pr-10 ${activo ? 'ring-2 ring-marca-600/25' : ''}`}
        />

        {buscando && (
          <span className="absolute inset-y-0 right-3 flex items-center text-marca-600">
            <Spinner />
          </span>
        )}
      </div>

      {abierto && (
        <ListaSugerencias
          id={listaId}
          etiqueta={etiqueta}
          sugerencias={sugerencias}
          indiceActivo={indiceActivo}
          onResaltar={setIndiceActivo}
          onElegir={elegir}
        />
      )}

      <p className="mt-1 text-[11px] text-slate-500">
        Busqueda de direcciones por OpenStreetMap (Nominatim).
      </p>
    </div>
  )
}
