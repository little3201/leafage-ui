import { defineConfig } from "oxfmt";

export default defineConfig({
  $schema: "./node_modules/oxfmt/configuration_schema.json",

  ignorePatterns: ["**/node_modules/", "dist/", "src/router/typed-router.d.ts"],

  printWidth: 80,
  arrowParens: "avoid",
  bracketSpacing: true,
  bracketSameLine: false,
  htmlWhitespaceSensitivity: "strict",
  semi: true,
  singleQuote: false,
  quoteProps: "as-needed",
  trailingComma: "none",
  useTabs: false,
  vueIndentScriptAndStyle: false
});
