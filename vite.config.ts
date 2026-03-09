import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_PRERENDER_ROUTES = [
  "/",
  "/heritage-sites",
  "/artifacts",
  "/history",
  "/exhibitions",
];

const loadPrerenderRoutes = () => {
  const routeFilePath = path.resolve(__dirname, "./scripts/prerender-routes.json");

  try {
    const fileContent = fs.readFileSync(routeFilePath, "utf8");
    const parsed = JSON.parse(fileContent);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (error) {
    console.warn("[seo] prerender-routes.json is missing or invalid. Falling back to defaults.");
  }

  return DEFAULT_PRERENDER_ROUTES;
};

export default defineConfig(async ({ command }) => {
  const plugins = [react()];

  if (command === "build") {
    try {
      const prerenderModule = await import("vite-plugin-prerender");
      const vitePrerender = prerenderModule.default;

      plugins.push(
        vitePrerender({
          staticDir: path.join(__dirname, "dist"),
          routes: loadPrerenderRoutes(),
          renderer: new vitePrerender.PuppeteerRenderer({
            maxConcurrentRoutes: 4,
            renderAfterDocumentEvent: "prerender-ready",
            skipThirdPartyRequests: true,
            injectProperty: "__PRERENDER_INJECTED",
            inject: {
              prerender: true,
            },
            headless: true,
          }),
        })
      );
    } catch (error) {
      throw new Error(
        "Missing dependency 'vite-plugin-prerender'. Run 'npm install' in Web before 'npm run build'."
      );
    }
  }

  return {
    plugins,
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
    force: true,
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
  };
});
