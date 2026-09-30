import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
  build: {
    rollupOptions: {
      // Native modules must remain external so Forge can rebuild and unpack them.
      external: ['better-sqlite3'],
    },
  },
});
