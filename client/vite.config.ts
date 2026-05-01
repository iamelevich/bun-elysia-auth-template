import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    devtools(),
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
  ],
  build: {
    outDir: "../dist/client",
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/auth/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      react: path.resolve(__dirname, "../node_modules/react"),
      "react-dom": path.resolve(__dirname, "../node_modules/react-dom"),
      "react-dom/client": path.resolve(
        __dirname,
        "../node_modules/react-dom/client",
      ),
      "@tanstack/react-form": path.resolve(
        __dirname,
        "../node_modules/@tanstack/react-form",
      ),
      "@tanstack/react-store": path.resolve(
        __dirname,
        "../node_modules/@tanstack/react-store",
      ),
      "use-sync-external-store": path.resolve(
        __dirname,
        "../node_modules/use-sync-external-store",
      ),
    },
    dedupe: ["react", "react-dom"],
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
    globals: true,
    server: {
      deps: {
        inline: [/node_modules\/\.bun\//, /^@testing-library\//],
      },
    },
    coverage: {
      enabled: true,
      provider: "v8",
      reporter: ["text", "lcov"],
      exclude: ["src/routeTree.gen.ts", "src/components/ui/**"],
    },
  },
});
