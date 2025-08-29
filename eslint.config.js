import js from "@eslint/js";
import globals from "globals";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import jest from "eslint-plugin-jest";
import jsdoc from "eslint-plugin-jsdoc";
import prettier from "eslint-plugin-prettier";
import stylisticJs from "@stylistic/eslint-plugin-js";

export default [
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    ignores: [
      "build/*",
      "**/build/**",
      "**/*.cjs",
      "**/*.d.ts",
      ".prettierrc.cjs",
    ],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: "module",
      },
      globals: {
        ...globals.node,
        console: "readonly",
        setTimeout: "readonly",
        __dirname: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      jest,
      jsdoc,
      prettier,
      "@stylistic/js": stylisticJs,
    },
    rules: {
      "prettier/prettier": "warn",
      "arrow-body-style": "off",
      "prefer-arrow-callback": "off",
      "jsdoc/require-asterisk-prefix": ["error", "never"],
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          varsIgnorePattern: "^_",
          argsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      // Standard no-unused-vars should also follow the same pattern
      "no-unused-vars": [
        "warn",
        {
          varsIgnorePattern: "^_",
          argsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      // Disable some problematic rules
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      // Allow redeclaring interfaces/types (common in TypeScript)
      "no-redeclare": "off",
      "@typescript-eslint/no-redeclare": "off",
      // Allow undefined globals for DOM types
      "no-undef": "off",
    },
    settings: {
      jest: {
        version: 29,
      },
    },
  },
  {
    files: ["test/**/*.ts", "*.test.ts", "**/*.test.ts", "**/*.test-d.ts"],
    languageOptions: {
      globals: {
        ...globals.jest,
        beforeEach: "readonly",
        afterEach: "readonly",
        test: "readonly",
        expect: "readonly",
        describe: "readonly",
        it: "readonly",
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "no-unused-vars": "off", // Allow unused vars in tests
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
];
