import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' permite publicar el build en cualquier subcarpeta o abrirlo desde un hosting estático
export default defineConfig({
  base: './',
  plugins: [react()],
  server: { port: 5520 },
  preview: { port: 5521 }
});
