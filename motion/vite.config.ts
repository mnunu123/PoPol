import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// 빌드 결과는 저장소 루트의 /v3 에 들어간다 → Vercel(정적, output ".")에서 /v3/ 로 바로 서비스.
export default defineConfig({
  base: '/v3/',
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  server: { fs: { allow: ['..'] }, port: 5173 },
  build: {
    outDir: path.resolve(__dirname, '../v3'),
    emptyOutDir: true,
    sourcemap: false,
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: {
          remotion: ['remotion', '@remotion/player'],
          vendor: ['react', 'react-dom', 'react-router-dom', 'framer-motion'],
        },
      },
    },
  },
});
