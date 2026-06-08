import { defineConfig } from 'vite';

export default defineConfig({
  optimizeDeps: {
    exclude: [
      'react',
      'react-dom',
      'react-dom/client',
      'htm',
      'lucide-react',
      'lenis',
      'media-data'
    ]
  }
});
