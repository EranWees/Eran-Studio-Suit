import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY_1': JSON.stringify(env.GEMINI_API_KEY_1 || 'AIzaSyCuua3O3CRb5L3xsGnJzLOw70SxXjkhGc8'),
      'process.env.API_KEY_2': JSON.stringify(env.GEMINI_API_KEY_2 || 'AIzaSyBZEZWXikmhtk3SUDKnLST5yLahMFW2zts'),
      'process.env.API_KEY_3': JSON.stringify(env.GEMINI_API_KEY_3 || 'AIzaSyDVQuG8wD2E76cTk3nRp74g-82iOF59ZyM'),
      'process.env.API_KEY_4': JSON.stringify(env.GEMINI_API_KEY_4 || 'AIzaSyC0ld1LoY1YY_qIY-bWIszx5fs_Z5EQKB0'),
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
