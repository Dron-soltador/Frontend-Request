/** Modelo y constantes del paquete. Sin JSX: lo comparten el formulario y la pagina. */

export const CATEGORIAS = [
  { valor: 'Estandar', etiqueta: 'Estandar', descripcion: 'Sin cuidados especiales' },
  { valor: 'Fragil', etiqueta: 'Fragil', descripcion: 'Manejo delicado, +15%' },
] as const

export interface DatosPaquete {
  peso_kg: number
  fecha_programada: string
  /**
   * Unica fuente de verdad de la fragilidad. Antes `categoria` y `es_fragil` eran
   * dos estados independientes y ended desincronizados: el recargo se cobraba
   * mientras el radio "Fragil" seguia marcado como "Estandar".
   * `es_fragil` se deriva de aqui: `esFragil(categoria)`.
   */
  categoria: string
  es_urgente: boolean
  descripcion: string
}

/** El backend cobra el recargo de fragilidad a partir de `es_fragil`. */
export function esFragil(categoria: string): boolean {
  return categoria === 'Fragil'
}

export const PAQUETE_VACIO: DatosPaquete = {
  peso_kg: 0,
  fecha_programada: '',
  categoria: 'Estandar',
  es_urgente: false,
  descripcion: '',
}

/** Fecha local en formato YYYY-MM-DD, para el min del input date. */
export function hoy(): string {
  const ahora = new Date()
  const desfase = ahora.getTimezoneOffset() * 60_000
  return new Date(ahora.getTime() - desfase).toISOString().slice(0, 10)
}
