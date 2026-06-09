import { defineConfig } from 'vite';

const externalImports = [
  'react',
  'react-dom',
  'react-dom/client',
  'htm',
  'lucide-react',
  'lenis',
  'media-data',
  'animejs'
];

function viteIgnoreStaticImport(importKeys) {
  const escapedKeys = importKeys.map(k => k.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
  const reg = new RegExp(`/@id/(${escapedKeys.join('|')})(?:\\?[^"']*)?`, 'g');

  return {
    name: 'vite-plugin-ignore-static-import',
    enforce: 'pre',
    config(config) {
      config.optimizeDeps = {
        ...(config.optimizeDeps ?? {}),
        exclude: [...(config.optimizeDeps?.exclude ?? []), ...importKeys],
      };
    },
    configResolved(resolvedConfig) {
      resolvedConfig.plugins.push({
        name: 'vite-plugin-ignore-static-import-replace-idprefix',
        transform: (code) => reg.test(code) ? code.replace(reg, (m, s1) => s1) : code,
      });
    },
    resolveId(id) {
      if (importKeys.includes(id)) {
        return { id, external: true };
      }
      return null;
    },
    load(id) {
      if (importKeys.includes(id)) {
        return 'export default {};';
      }
      return null;
    }
  };
}

export default defineConfig({
  base: './',
  plugins: [
    viteIgnoreStaticImport(externalImports)
  ],
  build: {
    rollupOptions: {
      external: externalImports
    }
  }
});
