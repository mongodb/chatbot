import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

const testConfig = defineConfig({
  test: {
    environment: "node",
    globals: true,
  },
});

export default defineConfig((configEnv) =>
  mergeConfig(viteConfig(configEnv), testConfig)
);
