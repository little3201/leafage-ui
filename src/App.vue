<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import zhTw from 'element-plus/es/locale/lang/zh-tw'
import en from 'element-plus/es/locale/lang/en'


const { locale } = useI18n({ useScope: 'global' })

const lang = computed(() => {
  switch (locale.value) {
    case 'zh-CN':
      return zhCn
    case 'zh-TW':
      return zhTw
    case 'en-US':
      return en
    default:
      return zhCn
  }
})
</script>

<template>
  <ElConfigProvider :locale="lang">
    <RouterView />
  </ElConfigProvider>
</template>
