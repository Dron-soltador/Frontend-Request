import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  /**
   * Durante el desarrollo el frontend corre en :5173 y el backend en :3001,
   * por eso CORS no alcanza y usamos el proxy de Vite. La variable
   * VITE_API_PROXY_TARGET permite apuntar al backend levantado con Docker
   * (por ejemplo http://localhost:3001 o la IP del servidor de la PRESENTACION).
   */
  const proxyTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:3001'

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 5173,
      proxy: {
        '/api': { target: proxyTarget, changeOrigin: true },
        '/auth': { target: proxyTarget, changeOrigin: true },
      },
    },
  }
})