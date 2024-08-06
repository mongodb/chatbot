import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    nodePolyfills({
      exclude: [
        "fs", // Excludes the polyfill for `fs` and `node:fs`.
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
  root: ".",
  build: {
    outDir: "../chatbot-server-mongodb-public/static",
  },
});
