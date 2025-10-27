/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

export default defineConfig(({ mode }) => ({
  root: __dirname,
  cacheDir: '../../../node_modules/.vite/apps/lmnp/frontend',
  server: {
    port: 4200,
    host: 'localhost',
  },
  preview: {
    port: 4300,
    host: 'localhost',
  },
  plugins: [react(), nxViteTsPaths()],
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },
  build: {
    outDir: './dist',
    emptyOutDir: true,
    reportCompressedSize: false, // Disable to speed up builds
    target: 'es2020', // Modern target for less transpilation
    minify: true,
    sourcemap: mode === 'development', // Source maps in development
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        manualChunks:
          mode === 'production'
            ? {
                'react-vendor': ['react', 'react-dom', 'react/jsx-runtime'],
              }
            : undefined,
      },
    },
  },
}));
