import { defineConfig } from 'vite';
import type { ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import type { IncomingMessage, ServerResponse } from 'http';

// Plugin to redirect /admin to /admin/ in dev mode
const redirectToBasePlugin = () => ({
  name: 'redirect-to-base',
  configureServer(server: ViteDevServer) {
    server.middlewares.use(
      (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        // Redirect /admin (without trailing slash) to /admin/
        if (req.url === '/admin') {
          res.statusCode = 302;
          res.setHeader('Location', '/admin/');
          res.end();
          return;
        }
        next();
      },
    );
  },
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), redirectToBasePlugin()],
  base: '/admin/',
  build: {
    outDir: '../public/admin',
    emptyOutDir: true,
  },
  server: {
    proxy: {
      '/api/v1/auth/send-otp': {
        target: 'https://services.kiranaapps.com',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true,
      },
    },
  },
});
