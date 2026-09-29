import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      babel({ presets: [reactCompilerPreset()] })
    ],
    define: {
      'import.meta.env.VITE_BACKEND_URL': JSON.stringify(env.BACKEND_URL || 'http://localhost:8000'),
    },
    server: {
      proxy: {
        '/chat/ws': {
          target: env.BACKEND_URL || 'http://localhost:8000',
          ws: true,
        },
      },
    },
  };
});
