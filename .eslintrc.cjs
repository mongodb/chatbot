module.exports = {
  env: {
    node: true,
  },
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "jest", "jsdoc", "prettier", "@stylistic/js"],
  extends: [
    "eslint:recommended",
    "prettier",
    "plugin:@typescript-eslint/recommended",
  ],
  ignorePatterns: ["build/*"],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: "module",
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
    "padding-line-between-statements": [
      "warn",
      {
        blankLine: "always",
        prev: ["function", "class"],
        next: "*",
      },
    ],
    "@stylistic/js/lines-between-class-members": ["warn", "always"],
    "@stylistic/js/lines-around-comment": [
      "warn",
      {
        beforeBlockComment: true,
        allowBlockStart: true,
        allowArrayStart: true,
        allowObjectStart: true,
        allowClassStart: true,
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
