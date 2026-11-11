import type { Punto } from '../mapa/geometria'
import { BuscadorDireccion } from '../mapa/BuscadorDireccion'
import { SelectorPuntos } from '../mapa/SelectorPuntos'
import type { PuntoActivo } from '../mapa/selectorTipos'
import type { Sugerencia } from '../../services/geocodificacion'
import type { PuntoEtiquetado } from '../../state/localizacion'
import { TarjetaPunto } from './TarjetaPunto'

interface Props {
  origen: PuntoEtiquetado | null
  destino: PuntoEtiquetado | null
  activo: PuntoActivo
  revisionEncuadre: number
  onActivoChange: (activo: PuntoActivo) => void
  onCambios: (cambios: { origen?: Punto; destino?: Punto }) => void
  onElegirSugerencia: (
    clave: 'origen' | 'destino',
  ) => (sugerencia: Sugerencia) => void
  onError: (mensaje: string) => void
}

/** Paso 1: mapa, buscadores de direccion y resumen de ambos puntos. */
export function SeccionPuntos({
  origen,
  destino,
  activo,
  revisionEncuadre,
  onActivoChange,
  onCambios,
  onElegirSugerencia,
  onError,
}: Props) {
  return (
    <>
      <SelectorPuntos
        origen={origen?.punto ?? null}
        destino={destino?.punto ?? null}
        activo={activo}
        onActivoChange={onActivoChange}
        onChange={onCambios}
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
          onElegir={onElegirSugerencia('origen')}
          onError={onError}
        />
        <BuscadorDireccion
          etiqueta="Direccion de destino (Punto B)"
          placeholder="Parque Centenario, Buenos Aires"
          activo={activo === 'destino'}
          valor={destino?.direccion ?? ''}
          onElegir={onElegirSugerencia('destino')}
          onError={onError}
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
    </>
  )
}
