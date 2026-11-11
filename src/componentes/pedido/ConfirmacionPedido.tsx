import { IconoAlerta, IconoCheck } from './IconosPedido'

interface Props {
  id: number
  costo: number | null
  notificado: boolean
}

/**
 * Confirmacion visible tras un envio exitoso. El criterio de aceptacion pide
 * limpiar el formulario y mostrar un mensaje: el formulario ya se limpio y este
 * bloque es el mensaje persistente (el toast se va solo a los 5 segundos).
 *
 * Distingue si el despachador recibio la notificacion, porque el backend puede
 * guardar el pedido y aun asi no logro avisar al administrador.
 */
export function ConfirmacionPedido({ id, costo, notificado }: Props) {
  return (
    <section
      className={`rounded-xl border p-5 ${
        notificado ? 'border-emerald-300 bg-emerald-50' : 'border-amber-300 bg-amber-50'
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`flex size-9 shrink-0 items-center justify-center rounded-full text-white ${
            notificado ? 'bg-emerald-600' : 'bg-amber-600'
          }`}
        >
          {notificado ? <IconoCheck /> : <IconoAlerta />}
        </span>

        <div>
          <h2
            className={`text-sm font-semibold ${
              notificado ? 'text-emerald-900' : 'text-amber-900'
            }`}
          >
            Pedido #{id} registrado correctamente
          </h2>
          <p className={`mt-1 text-sm ${notificado ? 'text-emerald-800' : 'text-amber-800'}`}>
            {notificado
              ? 'El despachador recibio la solicitud y buscara un dron disponible. Tu pedido quedo en estado PENDIENTE.'
              : 'Tu pedido quedo en estado PENDIENTE, pero el despachador no respondio a tiempo. Quedara pendiente de asignacion hasta que se le avise.'}
            {costo != null && ` Costo registrado: $${costo.toLocaleString('es-AR')}.`}
          </p>
          <p className={`mt-1 text-xs ${notificado ? 'text-emerald-700' : 'text-amber-700'}`}>
            El formulario se limpio para que puedas cargar un nuevo envio.
          </p>
        </div>
      </div>
    </section>
  )
}
