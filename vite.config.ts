import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@services": path.resolve(__dirname, "./src/services"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@store": path.resolve(__dirname, "./src/store"),
      "@layouts": path.resolve(__dirname, "./src/layouts"),
      "@assets": path.resolve(__dirname, "./src/assets"),
      "@contexts": path.resolve(__dirname, "./src/contexts"),
      "@config": path.resolve(__dirname, "./src/config"),
      "@types": path.resolve(__dirname, "./src/types"),
    },
  },
  server: {
    port: 3001,
    open: false, // Disabled for Docker compatibility
    host: true, // Listen on all interfaces for Docker
    watch: {
      usePolling: true, // Required for Docker on Windows/WSL
      interval: 1000, // Check for changes every second
    },
    hmr: {
      overlay: true,
    },
    proxy: {
      "/api": {
        target: "http://sen-backend-dev:3000",
        changeOrigin: true,
        secure: false,
      },
      "/uploads": {
        target: "http://sen-backend-dev:3000",
        changeOrigin: true,
        secure: false,
      },
    },
    allowedHosts: true,
  },
  optimizeDeps: {
    include: ["pixi.js", "@pixi/react"],
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "ui-vendor": ["antd", "@ant-design/icons", "framer-motion"],
          "utils-vendor": ["axios", "dayjs", "lodash"],
          "game-vendor": ["pixi.js", "@pixi/react"],
        },
      },
    },
  },
});
