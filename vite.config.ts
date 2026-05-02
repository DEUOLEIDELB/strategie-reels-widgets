import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Single-page app : un seul entry point.
// Le router interne (Shell + setView) bascule entre les 3 vues.
export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  // Dev-only : proxy local pour contourner CORS Grist (whitelist VPS = github.io uniquement).
  // En build prod, l'app appelle directement https://grist.playwubo.com.
  server: {
    proxy: {
      '/grist-api': {
        target: 'https://grist.playwubo.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/grist-api/, '/api'),
      },
    },
  },
});
