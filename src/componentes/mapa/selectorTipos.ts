import type { Punto } from './geometria'

/** Centro inicial: Ciudad de Buenos Aires. Solo define el encuadre de partida. */
export const CENTRO_INICIAL: Punto = { latitud: -34.6037, longitud: -58.3816 }
export const ZOOM_INICIAL = 13

export type PuntoActivo = 'origen' | 'destino'

export interface SelectorPuntosProps {
  origen: Punto | null
  destino: Punto | null
  onChange: (cambios: { origen?: Punto; destino?: Punto }) => void
  /** Punto que se coloca al hacer clic en el mapa. */
  activo: PuntoActivo
  onActivoChange: (activo: PuntoActivo) => void
  /** Direccion legible de cada punto, mostrada al pasar el cursor sobre el marcador. */
  direccionOrigen?: string
  direccionDestino?: string
  /**
   * Se incrementa cuando los puntos cambian fuera del mapa (por ejemplo al elegir
   * una direccion buscada o al recuperar un borrador) para que la vista se
   * reajuste. El clic ya reencuadra por su cuenta.
   */
  revisionEncuadre?: number
  className?: string
}
