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
    define: {
      'process.env.REGISTRY_ADDRESS': JSON.stringify(env.REGISTRY_ADDRESS),
      'process.env.REGISTRY_SEED': JSON.stringify(env.REGISTRY_SEED),
      'process.env.XRPL_NETWORK': JSON.stringify(env.XRPL_NETWORK),
      'process.env.DEFAULT_CURRENCY_ISSUER': JSON.stringify(env.DEFAULT_CURRENCY_ISSUER),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
