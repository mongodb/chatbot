import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { visualizer } from "rollup-plugin-visualizer";

function resolvePath(...pathSegments) {
  return path.resolve(__dirname, ...pathSegments);
}

const entryPath = resolvePath("src/index.tsx");

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
    visualizer(),
  ],
  build: {
    outDir: "build",
    lib: {
      entry: entryPath,
      name: "Chatbot",
      formats: ["es"],
    },
    rollupOptions: {
      input: {
        index: entryPath,
        // Chatbot Context Provider & Hooks
        Chatbot: resolvePath("src/Chatbot.tsx"),
        useChatbotContext: resolvePath("src/useChatbotContext.tsx"),
        useConversationContext: resolvePath("src/useConversationContext.tsx"),
        // Chatbot Triggers
        ActionButtonTrigger: resolvePath("src/ActionButtonTrigger.tsx"),
        FloatingActionButtonTrigger: resolvePath(
          "src/FloatingActionButtonTrigger.tsx"
        ),
        InputBarTrigger: resolvePath("src/InputBarTrigger.tsx"),
        // Chatbot Views
        ChatWindow: resolvePath("src/ChatWindow.tsx"),
        ModalView: resolvePath("src/ModalView.tsx"),
        // UI Copy
        MongoDbLegal: resolvePath("src/MongoDbLegal.tsx"),
        PoweredByAtlasVectorSearch: resolvePath(
          "src/PoweredByAtlasVectorSearch.tsx"
        ),
      },
      external: ["react", "react-dom"],
      output: {
        inlineDynamicImports: false, // multiple inputs are not supported when "output.inlineDynamicImports" is true.
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
        entryFileNames: `[name].js`,
        chunkFileNames: `[name].js`,
        assetFileNames: `[name].[ext]`,
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
