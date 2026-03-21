import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  // 1. Manually load the env from the root directory
  const env = loadEnv(mode, path.resolve(__dirname, '..'), '');

  return {
    plugins: [react()],
    // 2. Map the key so React can see it
    define: {
      'import.meta.env.TURNSTILE_SITE_KEY': JSON.stringify(env.TURNSTILE_SITE_KEY || env.VITE_TURNSTILE_SITE_KEY)
    },
    envDir: '../',
    envPrefix: ['VITE_', 'TURNSTILE_'],
    base: '/',
    
    server: {
      historyApiFallback: true,
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
          secure: false,
        },
      },
    },

    build: {
      outDir: 'dist',
      manifest: true,
      cssCodeSplit: false,
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          entryFileNames: `assets/[name].js`,
          chunkFileNames: `assets/[name].js`,
          assetFileNames: `assets/[name].[ext]`,
          manualChunks(id) {
            if (id.includes('react-syntax-highlighter')) return 'highlighter';
            if (id.includes('node_modules')) return 'vendor';
          }
        }
      }
    }
  }
})