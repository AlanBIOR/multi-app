import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // SUSTITUYE por el nombre exacto de tu nuevo repositorio si cambia
  base: '/Entrega-de-Ejercicios-1-JS/', 

  server: {
    watch: {
      usePolling: true, // Crucial para detectar cambios en tu Mini PC
    },
  },

  css: {
    devSourcemap: true, // Te ayuda a ver en qué línea de Sass está cada estilo al inspeccionar
  },

  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        buscaminas: resolve(__dirname, 'buscaminas.html'),
        sudoku: resolve(__dirname, 'sudoku.html'),
        gatos: resolve(__dirname, 'gatos.html'),
        rickandmorty: resolve(__dirname, 'rickandmorty.html'),
      },
    },
  },
});