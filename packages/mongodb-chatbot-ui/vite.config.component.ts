import path from "path";
import { defineConfig, loadEnv, PluginOption } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { visualizer } from "rollup-plugin-visualizer";

function resolvePath(...pathSegments) {
  return path.resolve(__dirname, ...pathSegments);
}

const entryPath = resolvePath("src/index.tsx");

const supportedModuleFormats = ["cjs", "es"] as const;
type SupportedModuleFormat = (typeof supportedModuleFormats)[number];

function getModuleFormat(env): SupportedModuleFormat {
  const format = env.VITE_MODULE_FORMAT || "es";
  if (!supportedModuleFormats.includes(format)) {
    throw new Error(`Invalid VITE_MODULE_FORMAT: ${format}`);
  }
  return format;
}

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const moduleFormat = getModuleFormat(env);

  return defineConfig({
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
      visualizer() as PluginOption,
    ],
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
    build: {
      outDir: `build/${moduleFormat}`,
      lib: {
        entry: entryPath,
        name: "Chatbot",
        formats: [moduleFormat],
        fileName: () => `mongodb-chatbot-ui.js`, // ES builds ignore this in favor of the code-split Rollup inputs,
      },
      rollupOptions: {
        external: ["react", "react-dom"],
        input: {
          index: entryPath,
          ...(moduleFormat === "es"
            ? // For ESM builds we use code-splitting to generate multiple files.
              {
                // Chatbot Context Provider & Hooks
                Chatbot: resolvePath("src/Chatbot.tsx"),
                useChatbotContext: resolvePath("src/useChatbotContext.tsx"),
                ConversationStateProvider: resolvePath(
                  "src/ConversationStateProvider.tsx"
                ),
                useConversationStateContext: resolvePath(
                  "src/useConversationStateContext.tsx"
                ),
                // Chatbot Triggers
                ActionButtonTrigger: resolvePath("src/ActionButtonTrigger.tsx"),
                FloatingActionButtonTrigger: resolvePath(
                  "src/FloatingActionButtonTrigger.tsx"
                ),
                HotkeyTrigger: resolvePath("src/HotkeyTrigger.tsx"),
                InputBarTrigger: resolvePath("src/InputBarTrigger.tsx"),
                // Chatbot Views
                ChatWindow: resolvePath("src/ChatWindow.tsx"),
                ChatMessageFeed: resolvePath("src/ChatMessageFeed.tsx"),
                ModalView: resolvePath("src/ModalView.tsx"),
                // Message Components
                MessageContent: resolvePath("src/MessageContent.tsx"),
                MessagePrompts: resolvePath("src/MessagePrompts.tsx"),
                MessageRating: resolvePath("src/MessageRating.tsx"),
                // UI Copy
                MongoDbLegal: resolvePath("src/MongoDbLegal.tsx"),
                PoweredByAtlasVectorSearch: resolvePath(
                  "src/PoweredByAtlasVectorSearch.tsx"
                ),
              }
            : // For CJS builds we can only generate a single file, so we don't specify any additional inputs
              {}),
        },
        output: {
          globals: {
            react: "React",
            "react-dom": "ReactDOM",
          },
          ...(moduleFormat === "es"
            ? {
                inlineDynamicImports: false,
                entryFileNames: `[name].js`,
                chunkFileNames: `[name].js`,
                assetFileNames: `[name].[ext]`,
              }
            : {
                inlineDynamicImports: true,
              }),
        },
      },
    },
  });
};
