const globals = require("globals");
const typescriptParser = require("@typescript-eslint/parser");
const typescriptPlugin = require("@typescript-eslint/eslint-plugin");
const jsdocPlugin = require("eslint-plugin-jsdoc");
const eslintConfigPrettier = require("eslint-config-prettier");

module.exports = [
  {
    files: ["src/**/*.ts"],
    ignores: [
      "build/",
      "node_modules/",
      "*.js",
      "*.cjs",
      "*.mjs",
      "vitest.config.ts",
    ],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: ".",
        sourceType: "module",
        ecmaVersion: 2022,
      },
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      "@typescript-eslint": typescriptPlugin,
      jsdoc: jsdocPlugin,
    },
    // Merge the base eslint rules with typescript and prettier rules
    rules: {
      ...typescriptPlugin.configs.recommended.rules,
      ...typescriptPlugin.configs["recommended-requiring-type-checking"].rules,
      ...typescriptPlugin.configs.strict.rules,
      ...eslintConfigPrettier.rules,
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
        },
      ],
      "@typescript-eslint/no-import-type-side-effects": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "jsdoc/require-asterisk-prefix": ["error", "never"],
      "prettier/prettier": "off",
      "arrow-body-style": "off",
      "prefer-arrow-callback": "off",
    },
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.json",
        },
      },
    },
  },
];
