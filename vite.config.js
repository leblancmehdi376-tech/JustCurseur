import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Discord Activities proxy — required for local dev inside Discord
    proxy: {
      '/.proxy': {
        target: 'https://discord.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/.proxy/, ''),
      },
    },
    allowedHosts: [
      'localhost',
      '*.discordsays.com',
      '*.discord.com',
    ],
  },
  // Required for Discord iframe — no hash routing
  base: '/',
});
