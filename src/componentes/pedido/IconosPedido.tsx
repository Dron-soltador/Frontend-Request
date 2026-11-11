/** Iconos SVG reutilizados por las secciones del pedido. */

export function IconoEstado({ sinGuardar }: { sinGuardar: boolean }) {
  const color = sinGuardar ? 'text-amber-600' : 'text-emerald-600'
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={2}
      stroke="currentColor"
      className={`size-5 shrink-0 ${color}`}
    >
      {sinGuardar ? (
        <path
          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  )
}

export function IconoGuardar() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={2}
      stroke="currentColor"
      className="size-4"
    >
      <path
        d="M9 3.75H6.75A2.25 2.25 0 0 0 4.5 6v13.5A2.25 2.25 0 0 0 6.75 21.75h10.5A2.25 2.25 0 0 0 19.5 18.75V8.31a2.25 2.25 0 0 0-.66-1.59l-3.07-3.07a2.25 2.25 0 0 0-1.59-.66H9.75M9 3.75c.38 0 .74.15 1.01.42l2.56 2.56a1.5 1.5 0 0 1 .43 1.06V6.75A2.25 2.25 0 0 1 10.75 9H9.75a2.25 2.25 0 0 1-2.25-2.25V5.25c0-.6.24-1.17.66-1.59L9 3.75Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function IconoCheck() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={2.2}
      stroke="currentColor"
      className="size-5"
    >
      <path d="m4.5 12.75 6 6 9-13.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconoAlerta() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={2}
      stroke="currentColor"
      className="size-5"
    >
      <path
        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
