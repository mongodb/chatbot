import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config.component";

const testConfig = defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
  },
});

export default defineConfig((configEnv) =>
  mergeConfig(viteConfig(configEnv), testConfig)
);
