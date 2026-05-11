import vuetify from 'eslint-config-vuetify'
import vue from 'eslint-plugin-vue'

export default vuetify({
  ts: true,
}, {
  plugins: {
    vue,
  },
  rules: {
    // <script setup> content should align with normal TypeScript files.
    'vue/script-indent': ['error', 2, { baseIndent: 0, switchCase: 1 }],
  },
})
