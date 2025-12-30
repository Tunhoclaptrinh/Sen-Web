import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Chỉ cần define @ là đủ để truy cập mọi thứ, nhưng giữ lại các cái chính để code ngắn gọn hơn
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@services': path.resolve(__dirname, './src/services'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@store': path.resolve(__dirname, './src/store'),
      '@layouts': path.resolve(__dirname, './src/layouts'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@contexts': path.resolve(__dirname, './src/contexts'),
      '@config': path.resolve(__dirname, './src/config'), // Thêm cái này
    },
  },
  server: {
    port: 3001,
    open: true, // Tự động mở browser khi chạy dev
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Tắt sourcemap ở production để nhẹ và bảo mật hơn
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['antd', '@ant-design/icons', 'framer-motion'], // Gom nhóm UI
          'utils-vendor': ['axios', 'dayjs', 'lodash'],
          'game-vendor': ['pixi.js', '@pixi/react'], // Tách riêng thư viện game nặng
        },
      },
    },
  },
});