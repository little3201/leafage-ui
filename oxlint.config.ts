import { defineConfig } from "oxlint";

export default defineConfig({
  $schema: "./node_modules/oxlint/configuration_schema.json",

  ignorePatterns: [
    "**/node_modules/",
    "dist/",
    "**/mockServiceworker.js",
    "src/router/typed-router.d.ts"
  ],

  options: {
    typeAware: true,
    typeCheck: true,
    maxWarnings: 10
  },

  plugins: ["typescript", "vue", "import", "eslint", "promise", "unicorn"],

  categories: {
    correctness: "error"
    // style: 'error',
    // pedantic: 'warn',
    // suspicious: 'error',
    // perf: 'error',
    // restriction: 'error'
  },

  rules: {
    // this rule, if on, would require explicit return type on the `render` function
    // '@typescript-eslint/explicit-function-return-type': 'off',
    "typescript/no-floating-promises": ["error", { ignoreVoid: true }],
    "typescript/no-unsafe-assignment": "warn",

    // allow console, debugger during development only
    "no-console": process.env.NODE_ENV === "production" ? "error" : "warn",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "warn"
  },

  env: {
    builtin: true
  }
});
