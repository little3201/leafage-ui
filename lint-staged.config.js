/**
 * @filename: lint-staged.config.js
 * @type {import('lint-staged').Configuration}
 */
export default {
  '*.{js,mjs,ts,mts,vue}': 'eslint --fix --max-warnings=0',
  '*.{ts,tsx}': () => 'tsc --noEmit'
}