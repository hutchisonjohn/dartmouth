import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/widget.ts'),
      name: 'McCarthyChat',
      fileName: 'mccarthy-chat',
      formats: ['iife'] // Immediately Invoked Function Expression - for embedding
    },
    outDir: 'dist',
    minify: 'esbuild', // Use esbuild instead of terser
    rollupOptions: {
      output: {
        // Ensure CSS is inlined
        assetFileNames: 'mccarthy-chat.[ext]'
      }
    }
  }
});

