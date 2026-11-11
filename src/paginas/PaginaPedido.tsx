import { useCallback } from 'react'

import { useAvisos } from '../componentes/avisos/ProveedorAvisos'
import { ConfirmacionPedido } from '../componentes/pedido/ConfirmacionPedido'
import { EncabezadoPedido } from '../componentes/pedido/EncabezadoPedido'
import { EstadoBorrador } from '../componentes/pedido/EstadoBorrador'
import { ListaDirecciones } from '../componentes/pedido/ListaDirecciones'
import { SeccionPaquete } from '../componentes/pedido/SeccionPaquete'
import { SeccionPuntos } from '../componentes/pedido/SeccionPuntos'
import { useBorradorPedido } from '../hooks/useBorradorPedido'
import { useCotizacionPedido } from '../hooks/useCotizacionPedido'
import { useEnvioPedido } from '../hooks/useEnvioPedido'
import { usePaquetePedido } from '../hooks/usePaquetePedido'
import { usePuntosPedido } from '../hooks/usePuntosPedido'

/**
 * Seccion unica de solicitud. Reune en una sola pantalla todo el flujo del
 * pedido, sin fragmentarlo en modulos sueltos.
 *
 * Paso 1: puntos de entrega en el mapa. Paso 2: datos del paquete con cotizacion
 * en vivo contra `POST /api/v1/pedidos/cotizar`. Paso 3: envio con
 * `POST /api/v1/pedidos`, que ademas notifica al despachador del administrador.
 */
export default function PaginaPedido() {
  const { error } = useAvisos()

  const puntos = usePuntosPedido()
  const paquete = usePaquetePedido()
  const cotizacion = useCotizacionPedido(puntos.origen, puntos.destino, paquete.paquete)
  const borrador = useBorradorPedido({
    origen: puntos.origen,
    destino: puntos.destino,
    activo: puntos.activo,
    restaurar: puntos.restaurar,
    limpiarPuntos: puntos.limpiar,
  })

  const limpiarFormulario = useCallback(() => {
    puntos.limpiar()
    paquete.limpiarPaquete()
    borrador.olvidar()
  }, [puntos.limpiar, paquete.limpiarPaquete, borrador.olvidar])

  const envio = useEnvioPedido({
    origen: puntos.origen,
    destino: puntos.destino,
    paquete: paquete.paquete,
    cotizacion,
    validarPaquete: paquete.validarPaquete,
    onExito: limpiarFormulario,
  })

  return (
    <div className="flex min-h-dvh flex-col bg-slate-100">
      <EncabezadoPedido puedeEnviar={envio.puedeEnviar} />

      <main className="mx-auto w-full max-w-6xl flex-1 space-y-5 px-5 py-6 sm:px-8 sm:py-8">
        <EstadoBorrador
          borrador={borrador.borrador}
          sinGuardar={borrador.sinGuardar}
          completo={Boolean(puntos.origen && puntos.destino)}
          onGuardar={borrador.guardar}
          onDescartar={borrador.descartar}
        />

        {envio.ultimoPedido && (
          <ConfirmacionPedido
            id={envio.ultimoPedido.id}
            costo={envio.ultimoPedido.costo}
            notificado={envio.ultimoPedido.notificado}
          />
        )}

        <SeccionPuntos
          origen={puntos.origen}
          destino={puntos.destino}
          activo={puntos.activo}
          revisionEncuadre={puntos.revisionEncuadre}
          onActivoChange={puntos.setActivo}
          onCambios={puntos.aplicarCambios}
          onElegirSugerencia={puntos.elegirSugerencia}
          onError={error}
        />

        <SeccionPaquete
          datos={paquete.paquete}
          onChange={paquete.cambiarPaquete}
          errores={paquete.erroresPaquete}
          deshabilitado={envio.enviando}
          onEnviar={envio.enviar}
          puedeEnviar={envio.puedeEnviar}
          cotizacion={cotizacion}
        />

        <ListaDirecciones
          guardadas={borrador.guardadas}
          nombre={borrador.nombre}
          onNombreChange={borrador.setNombre}
          hayPunto={puntos.activo === 'origen' ? puntos.origen !== null : puntos.destino !== null}
          destinoActivo={puntos.activo === 'origen' ? 'origen' : 'destino'}
          onGuardar={borrador.guardarDireccionActual}
          onUsar={puntos.usarDireccion}
          onBorrar={borrador.borrarGuardada}
        />
      </main>
    </div>
  )
}
