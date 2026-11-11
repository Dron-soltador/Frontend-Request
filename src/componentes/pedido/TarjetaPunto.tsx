import { formatearCoordenada } from '../mapa/geometria'
import type { PuntoEtiquetado } from '../../state/localizacion'

interface Props {
  etiqueta: string
  punto: PuntoEtiquetado | null
  color: string
  vacio: string
}

/** Tarjeta con la direccion y coordenadas de un punto (o una ayuda si falta). */
export function TarjetaPunto({ etiqueta, punto, color, vacio }: Props) {
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
