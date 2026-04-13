import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      'purecloud-platform-client-v2': path.resolve(
        __dirname,
        'node_modules/purecloud-platform-client-v2/src/purecloud-platform-client-v2/index.js',
      ),
    },
  },
});
