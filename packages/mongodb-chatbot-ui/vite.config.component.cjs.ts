import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";

const entryPath = path.resolve(__dirname, "src/index.tsx");

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    nodePolyfills({
      exclude: [
        "fs" as never, // Excludes the polyfill for `fs` and `node:fs`.
      ],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      protocolImports: true,
    }),
    react(),
  ],
  build: {
    outDir: "build/cjs",
    lib: {
      entry: entryPath,
      name: "Chatbot",
      fileName: (format) => `mongodb-chatbot-ui.${format}.js`,
    },
    rollupOptions: {
      external: ["react", "react-dom"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
    },
  },
  server: {
    port: 5173,
  },
});
