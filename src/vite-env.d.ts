/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL base del microservicio de Pedidos. Vacia = usar el proxy de Vite. */
  readonly VITE_API_BASE_URL?: string
  /** Destino del proxy de Vite durante el desarrollo. */
  readonly VITE_API_PROXY_TARGET?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}