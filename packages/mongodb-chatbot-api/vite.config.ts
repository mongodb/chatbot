import { defineConfig, loadEnv } from "vite";
import { builtinModules } from "module";
import path from "path";
import dts from "vite-plugin-dts";

function resolvePath(...pathSegments) {
  return path.resolve(__dirname, ...pathSegments);
}

const supportedBuildTargets = ["client", "server"] as const;
type SupportedBuildTarget = (typeof supportedBuildTargets)[number];

function getBuildInfo(env): {
  buildTarget: SupportedBuildTarget | null;
  outDir: string;
  libEntry: string;
  libName: string;
  libFileName: (format: string) => string;
} {
  const buildTarget = env.VITE_BUILD_TARGET ?? null;
  if (buildTarget && !supportedBuildTargets.includes(buildTarget)) {
    throw new Error(`Invalid VITE_BUILD_TARGET: ${buildTarget}`);
  }
  return {
    buildTarget,
    libEntry: resolvePath(
      `${buildTarget ? `src/${buildTarget}` : `src`}/index.ts`
    ),
    libName: `mongodb-chatbot-api-${buildTarget}`,
    libFileName: (format) =>
      buildTarget
        ? `mongodb-chatbot-api-${buildTarget}.${format}.js`
        : `mongodb-chatbot-api.${format}.js`,
    outDir: buildTarget ? `build/${buildTarget}` : `build`,
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const { libEntry, libName, libFileName, outDir } = getBuildInfo(env);
  return {
    plugins: [dts()],
    build: {
      outDir,
      lib: {
        entry: libEntry,
        formats: ["es", "cjs"],
        name: libName,
        fileName: libFileName,
      },
      sourcemap: true,
      minify: false,
      rollupOptions: {
        external: [
          ...builtinModules,
          "fetch", // for environments where 'fetch' is provided by runtime
        ],
        output: {
          globals: {
            fetch: "fetch",
          },
        },
      },
    },
  };
});
