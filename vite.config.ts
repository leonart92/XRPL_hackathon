import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const port = parseInt(env.VITE_PORT || '3000', 10);
  const host = env.VITE_HOST || '0.0.0.0';

  return {
    server: {
      port,
      host,
    },
    plugins: [react()],
    define: {},
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
