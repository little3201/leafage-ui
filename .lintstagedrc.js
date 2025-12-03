module.exports = {
  '*.{js,jsx,ts,tsx}': [
    'eslint --fix --max-warnings=0',
    // 可选：如果有测试文件需要检查
    // 'jest --bail --findRelatedTests --passWithNoTests'
  ],
  '*.{vue}': ['eslint --fix --max-warnings=0'],

  // 可忽略某些文件
  '!(*.{spec,test}).{js,jsx,ts,tsx}': ['eslint --fix'],

  // 类型检查
  '*.{ts,tsx}': () => 'tsc --noEmit'
}