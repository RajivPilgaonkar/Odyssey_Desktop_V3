import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // only pick up REACT_APP_* keys from .env, keeping the file itself unchanged
  const env = loadEnv(mode, process.cwd(), 'REACT_APP_');

  return {
    plugins: [react()],
    server: {
      port: 3000,
      proxy: {
        // mirrors src/setupProxy.js, which CRA's dev server used automatically
        // but which Vite does not read
        '/db': {
          target: 'http://localhost:5100',
          changeOrigin: true,
        },
      },
    },
    define: {
      // keeps process.env.REACT_APP_* working in source as-is, instead of
      // requiring a switch to import.meta.env / VITE_-prefixed vars
      'process.env.REACT_APP_HOST': JSON.stringify(env.REACT_APP_HOST),
      'process.env.REACT_APP_PORT': JSON.stringify(env.REACT_APP_PORT),
      // CRA injects this automatically; the app is served from the domain root
      'process.env.PUBLIC_URL': JSON.stringify(''),
    },
  };
});
