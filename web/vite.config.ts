import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import type { PluginOption } from 'vite';

const fivemHtmlPlugin = (): PluginOption => ({
  name: 'fix-html-for-fivem',
  apply: 'build',
  generateBundle(_, bundle) {
    for (const item of Object.values(bundle)) {
      if (item.type !== 'asset' || !item.fileName.endsWith('.html')) continue;

      item.source = String(item.source)
        .replace(/\s+type="module"/g, '')
        .replace(/\s+crossorigin/g, '')
        .replace(/<link rel="modulepreload"[^>]*>\s*/g, '');
    }
  },
});

export default defineConfig({
  plugins: [react(), fivemHtmlPlugin()],
  base: './',
  publicDir: false,
  build: {
    outDir: 'build',
    target: 'chrome103',
    cssTarget: 'chrome103',
    cssCodeSplit: false,
    emptyOutDir: true,
    rolldownOptions: {
      output: {
        format: 'iife',
        name: 'OxInventoryNui',
        inlineDynamicImports: true,
        assetFileNames: 'assets/[name][extname]',
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
      },
    },
  },
});
