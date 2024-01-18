module.exports = {
  env: {
    node: true,
  },
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "jest", "jsdoc"],
  extends: [
    "eslint:recommended",
    "prettier",
    "plugin:prettier/recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  ignorePatterns: ["build/*"],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
  },
  rules: {
    "jsdoc/require-asterisk-prefix": ["error", "never"],
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        varsIgnorePattern: "^_",
        argsIgnorePattern: "^_",
        ignoreRestSiblings: true,
      },
    ],
  },
  overrides: [
    {
      files: ["test/**/*.ts", "*.test.ts"],
      env: {
        "jest/globals": true,
      },
    },
  ],
  settings: {
    jest: {
      version: 29,
    },
  },
};
