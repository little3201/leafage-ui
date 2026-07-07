/**
 * @filename: lint-staged.config.js
 * @type {import('lint-staged').Configuration}
 */
export default {
  "*.{js,mjs,ts,mts,vue}": "pnpm run lint",
  "*.{ts,tsx}": () => "tsc --noEmit",
  "*": "oxfmt --no-error-on-unmatched-pattern"
};
