/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig(() => ({
  // Répertoire racine du projet
  root: __dirname,

  // Cache partagé Vite pour améliorer les performances de build
  cacheDir: '../../../node_modules/.vite/apps/lmnp/frontend',

  // Configuration du serveur de développement
  server: {
    port: 4200,
    host: 'localhost',
  },

  // Configuration du serveur de preview (après build)
  preview: {
    port: 4200,
    host: 'localhost',
  },

  // Résolution des modules : permet d'utiliser les sources TypeScript
  // des bibliothèques du monorepo au lieu des fichiers compilés
  // resolve: {
  //   conditions: ['@testopilo/source'],
  // },

  // Plugins Vite : React avec SWC pour une compilation ultra-rapide
  plugins: [react()],

  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },

  // Configuration de build pour la production
  build: {
    outDir: './dist',
    emptyOutDir: true,
    reportCompressedSize: true,

    // Compatibilité avec les modules CommonJS mixés avec ESM
    commonjsOptions: {
      transformMixedEsModules: true,
    },

    // Sépare le CSS en plusieurs fichiers pour améliorer le chargement
    cssCodeSplit: true,

    // Utilise esbuild pour la minification (plus rapide que terser)
    minify: 'esbuild' as const,

    // Configuration avancée Rollup
    rollupOptions: {
      output: {
        // Sépare React et ReactDOM dans un chunk vendor dédié
        // pour un meilleur cache navigateur (ces libs changent rarement)
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },

  // Configuration CSS
  css: {
    // Active les source maps CSS en développement pour faciliter le debug
    devSourcemap: true,
  },

  // Configuration Vitest pour les tests unitaires
  test: {
    name: 'lmnp-frontend',
    watch: false,
    globals: true,
    environment: 'jsdom',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: './test-output/vitest/coverage',
      provider: 'v8' as const,
    },
  },
}));
