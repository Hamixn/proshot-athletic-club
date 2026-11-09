import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';
import { handleApiRequest } from './server/app';

function proshotStandaloneApiPlugin(): Plugin {
  return {
    name: 'proshot-standalone-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/v1')) {
          return next();
        }
        const url = new URL(req.url, 'http://localhost');
        let rawBody = '';
        for await (const chunk of req) {
          rawBody += chunk;
        }
        let parsedBody: any = {};
        if (rawBody) {
          try {
            parsedBody = JSON.parse(rawBody);
          } catch {
            parsedBody = {};
          }
        }
        try {
          const result = await handleApiRequest(
            req.method || 'GET',
            url.pathname,
            url.searchParams,
            parsedBody,
            req.headers.authorization as string | undefined
          );
          res.statusCode = result.status;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify(result.body));
        } catch (err: any) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ success: false, message: err?.message || 'Server Error' }));
        }
      });
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), proshotStandaloneApiPlugin()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },
});
