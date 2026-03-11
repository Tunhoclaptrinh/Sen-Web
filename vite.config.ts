import { defineConfig, type PluginOption, type UserConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

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

export default defineConfig(({ command }) => {
  const plugins: PluginOption[] = [...react()];
  const requirePrerender = process.env.VITE_REQUIRE_PRERENDER === "true";

  if (command === "build") {
    try {
      const prerenderPackageName = "vite-plugin-prerender";
      const prerenderModule = require(prerenderPackageName);
      
      // The plugin often exports the main function directly or via .default
      const vitePrerender = typeof prerenderModule === 'function' 
        ? prerenderModule 
        : (prerenderModule?.default || prerenderModule?.vitePrerender);
        
      // PuppeteerRenderer is usually a property of the main function or the module
      const PuppeteerRenderer = prerenderModule?.PuppeteerRenderer || vitePrerender?.PuppeteerRenderer;

      if (!vitePrerender || typeof vitePrerender !== "function") {
        throw new Error("Invalid 'vite-plugin-prerender' export. Please check version compatibility.");
      }

      plugins.push(
        vitePrerender({
          staticDir: path.join(__dirname, "dist"),
          routes: loadPrerenderRoutes(),
          renderer: new PuppeteerRenderer({
            maxConcurrentRoutes: 3, // Reduced for CI environments like Vercel
            renderAfterDocumentEvent: "prerender-ready",
            skipThirdPartyRequests: true,
            injectProperty: "__PRERENDER_INJECTED",
            inject: {
              prerender: true,
            },
            headless: true,
            // args: ['--no-sandbox', '--disable-setuid-sandbox'], // Required for many CI environments
          }),
        })
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      if (requirePrerender) {
        console.error("Critical SEO Error: Prerendering failed.");
        console.error("REASON:", errorMessage);
        console.error("TIP: If you are deploying to Vercel/CI, ensure Puppeteer is supported or set VITE_REQUIRE_PRERENDER=false.");
        throw new Error(
          `Prerender is required but failed: ${errorMessage}`
        );
      }

      console.warn(`[seo] Skipping prerender step (VITE_REQUIRE_PRERENDER is false): ${errorMessage}`);
    }
  }

  const config: UserConfig = {
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

  return config;
});
