import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Abilita l'accesso da smartphone e rete locale (0.0.0.0)
    port: 3000,
    open: false,
    allowedHosts: true // Consente qualsiasi dominio di tunnel (localtunnel, ngrok, ecc.) senza blocchi
  }
})
