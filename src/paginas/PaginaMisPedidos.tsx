import { CalendarioPedidos } from '../componentes/pedidos/CalendarioPedidos'
import { AvisoCargaPedidos } from '../componentes/pedidos/AvisoCargaPedidos'
import { EncabezadoMisPedidos } from '../componentes/pedidos/EncabezadoMisPedidos'
import { PanelHistorial } from '../componentes/pedidos/PanelHistorial'
import { ResumenEstados } from '../componentes/pedidos/ResumenEstados'
import { usePedidosUsuario } from '../hooks/usePedidosUsuario'

/**
 * "Mis pedidos": historial en tabla + agenda mensual.
 * Consume `GET /api/v1/pedidos/usuario/:id` con el `usuario_id` del JWT.
 */
export default function PaginaMisPedidos() {
  const {
    carga,
    pedidos,
    visibles,
    conteo,
    diaSeleccionado,
    setDiaSeleccionado,
    reintentar,
  } = usePedidosUsuario()

  return (
    <div className="flex min-h-dvh flex-col bg-slate-100">
      <EncabezadoMisPedidos />

      <main className="mx-auto w-full max-w-6xl flex-1 space-y-5 px-5 py-6 sm:px-8 sm:py-8">
        <AvisoCargaPedidos
          cargando={carga.estado === 'cargando'}
          mensajeError={carga.estado === 'error' ? carga.mensaje : undefined}
          onReintentar={reintentar}
        />

        {carga.estado === 'lista' && (
          <>
            <ResumenEstados conteo={conteo} />

            <div className="grid items-start gap-5 lg:grid-cols-[22rem_1fr]">
              <CalendarioPedidos
                pedidos={pedidos}
                diaSeleccionado={diaSeleccionado}
                onSeleccionar={setDiaSeleccionado}
              />

              <PanelHistorial
                pedidos={visibles}
                diaSeleccionado={diaSeleccionado}
                onLimpiarFiltro={() => setDiaSeleccionado(null)}
              />
            </div>
          </>
        )}
      </main>
    </div>
  )
}
