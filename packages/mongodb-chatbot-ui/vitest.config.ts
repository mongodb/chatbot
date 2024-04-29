import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config.component";

const testConfig = defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    deps: {
      web: {
        transformGlobPattern: [
          /node_modules\/react-markdown/,
          /node_modules\/@lg-chat\/lg-markdown/,
          /node_modules\/@lg-chat\/message/,
        ],
      },
      optimizer: {
        web: {
          include: [
            "@lg-chat/message",
            "@lg-chat/lg-markdown",
            "react-markdown",
          ],
        },
      },
    },
  },
});

export default defineConfig((configEnv) =>
  mergeConfig(viteConfig(configEnv), testConfig)
);
