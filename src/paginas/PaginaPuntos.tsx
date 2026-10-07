import { useState } from 'react'

import { SelectorPuntos } from '../componentes/mapa/SelectorPuntos'
import type { PuntoActivo } from '../componentes/mapa/SelectorPuntos'
import { formatearCoordenada } from '../componentes/mapa/geometria'
import type { Punto } from '../componentes/mapa/geometria'

/**
 * Pantalla de definicion de puntos de entrega. El formulario completo de
 * solicitud (peso, categoria, urgencia y cotizacion) llega en su issue; esta
 * pantalla ya expone las coordenadas que ese formulario enviara a
 * `POST /api/v1/pedidos` con la forma {origen: {latitud, longitud}, destino: {...}}.
 */
export default function PaginaPuntos() {
  const [origen, setOrigen] = useState<Punto | null>(null)
  const [destino, setDestino] = useState<Punto | null>(null)
  const [activo, setActivo] = useState<PuntoActivo>('origen')

  return (
    <div className="flex min-h-dvh flex-col bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-5 py-4 sm:px-8">
          <h1 className="text-lg font-semibold text-marca-900">Definir puntos de entrega</h1>
          <p className="text-sm text-slate-600">
            Arrastra los marcadores o haz clic en el mapa para fijar el origen y el destino.
          </p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 space-y-5 px-5 py-6 sm:px-8 sm:py-8">
        <SelectorPuntos
          origen={origen}
          destino={destino}
          activo={activo}
          onActivoChange={setActivo}
          onChange={({ origen: nuevoOrigen, destino: nuevoDestino }) => {
            if (nuevoOrigen) setOrigen(nuevoOrigen)
            if (nuevoDestino) setDestino(nuevoDestino)
          }}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <TarjetaPunto
            etiqueta="Punto A (origen)"
            punto={origen}
            color="bg-emerald-600"
            vacio="Haz clic en el mapa o arrastra el marcador verde."
          />
          <TarjetaPunto
            etiqueta="Punto B (destino)"
            punto={destino}
            color="bg-red-600"
            vacio="Cambia a Punto B y haz clic en el mapa."
          />
        </div>

        <VistaPreviaPeticion origen={origen} destino={destino} />
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
  punto: Punto | null
  color: string
  vacio: string
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2.5">
        <span className={`flex size-6 items-center justify-center rounded-full ${color} text-xs font-bold text-white`}>
          {etiqueta.charAt(6)}
        </span>
        <h2 className="font-semibold text-slate-900">{etiqueta}</h2>
      </div>

      {punto ? (
        <dl className="mt-4 space-y-2 font-mono text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Latitud</dt>
            <dd className="font-semibold text-slate-900">{formatearCoordenada(punto.latitud)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Longitud</dt>
            <dd className="font-semibold text-slate-900">{formatearCoordenada(punto.longitud)}</dd>
          </div>
        </dl>
      ) : (
        <p className="mt-3 text-sm text-slate-500">{vacio}</p>
      )}
    </section>
  )
}

/**
 * Muestra el JSON exacto que se enviara al microservicio. Sirve de evidencia de
 * que el mapa entrega coordenadas validas segun `_coordenadas_pedido`.
 */
function VistaPreviaPeticion({ origen, destino }: { origen: Punto | null; destino: Punto | null }) {
  const listo = Boolean(origen && destino)

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-3">
        <h2 className="text-sm font-semibold text-slate-900">
          Payload para POST /api/v1/pedidos
        </h2>
      </div>
      <pre className="overflow-x-auto bg-slate-900 p-4 text-xs leading-relaxed text-slate-100">
        {JSON.stringify({ origen, destino }, null, 2)}
      </pre>
      {!listo && (
        <p className="border-t border-slate-200 bg-amber-50 px-5 py-2.5 text-xs text-amber-900">
          El backend exige ambos puntos: sin A y B la peticion responde HTTP 400.
        </p>
      )}
    </section>
  )
}