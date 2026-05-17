import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

import webExtension from 'vite-plugin-web-extension';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    webExtension({
      manifest: 'manifest.json',
      additionalInputs: ['src/content/index.ts'],
    }),
    viteStaticCopy({
      targets: [{ src: 'icons', dest: '.' }],
    }),
  ],
});
