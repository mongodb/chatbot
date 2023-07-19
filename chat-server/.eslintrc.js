module.exports = {
  env: {
    node: true,
  },
  root: true,
  parser: "@typescript-eslint/parser",
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:jest/recommended",
    "prettier",
  ],
  ignorePatterns: ["dist/", "node_modules/"],
  plugins: ["@typescript-eslint", "jest"],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
  },
  overrides: [
    {
      files: ["test/**/*.ts"],
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
