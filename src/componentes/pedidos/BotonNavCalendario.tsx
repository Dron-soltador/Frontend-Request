interface Props {
  etiqueta: string
  onClick: () => void
  trazo: string
}

/** Flecha de navegacion entre meses. */
export function BotonNavCalendario({ etiqueta, onClick, trazo }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={etiqueta}
      className="rounded-lg p-1.5 text-slate-600 transition hover:bg-slate-100"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth={2}
        stroke="currentColor"
        className="size-4"
      >
        <path d={trazo} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}
