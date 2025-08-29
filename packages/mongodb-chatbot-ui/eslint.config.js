import baseConfig from "../../eslint.config.js";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import storybook from "eslint-plugin-storybook";

// Extend base config with React-specific plugins
const reactConfig = [
  ...baseConfig,
  {
    ignores: ["src/vite-env.d.ts", "**/*.d.ts"],
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": "warn",
    },
  },
  // Storybook specific config
  {
    files: ["**/*.stories.@(js|jsx|ts|tsx|mdx)"],
    plugins: {
      storybook,
    },
    rules: {
      ...storybook.configs.recommended.rules,
    },
  },
];

export default reactConfig;
