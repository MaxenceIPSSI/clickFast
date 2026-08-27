const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
  {
    ignores: ["node_modules/**", "scores-api/node_modules/**", "stats_api/**"],
  },
  {
    files: ["script.js"],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "commonjs",
      globals: { ...globals.browser, ...globals.commonjs },
    },
    rules: {
      ...js.configs.recommended.rules,
      semi: ["error", "always"],
      "no-unused-vars": "error",
      eqeqeq: "error",
      "prefer-const": "error",
    },
  },
  {
    files: ["script.test.js"],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "commonjs",
      globals: { ...globals.browser, ...globals.node, ...globals.jest },
    },
    rules: {
      ...js.configs.recommended.rules,
      semi: ["error", "always"],
      "no-unused-vars": "error",
    },
  },
  {
    files: ["eslint.config.js", "scores-api/src/**/*.js"],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "commonjs",
      globals: globals.node,
    },
    rules: {
      ...js.configs.recommended.rules,
      semi: ["error", "always"],
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      eqeqeq: "error",
      "prefer-const": "error",
    },
  },
];
