import L from 'leaflet'

/**
 * Marcadores dibujados con `divIcon` en vez del icono raster por defecto de
 * Leaflet. Dos motivos:
 *   1. El icono por defecto se resuelve con rutas relativas a `leaflet.css` y se
 *      rompe al empaquetar con Vite (el bug clasico del "marker-icon.png not found").
 *   2. Necesitamos las etiquetas A y B legibles en la captura de evidencia.
 * El HTML se inyecta fuera del arbol de React, por eso el estilo vive en index.css.
 */
export function crearIconoPunto(etiqueta: 'A' | 'B'): L.DivIcon {
  return L.divIcon({
    className: 'marcador-punto',
    html: `<span class="marcador-punto__globo marcador-punto__globo--${etiqueta.toLowerCase()}"><span class="marcador-punto__letra">${etiqueta}</span></span>`,
    iconSize: [34, 34],
    iconAnchor: [17, 42], // la punta inferior ancla la coordenada exacta
    popupAnchor: [0, -40],
  })
}

/** Estilo de la polylinea que une A y B. */
export const ESTILO_TRAZADO: L.PolylineOptions = {
  color: '#3b5bdb',
  weight: 3,
  opacity: 0.75,
  dashArray: '8 8',
}