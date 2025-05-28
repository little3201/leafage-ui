<script setup lang="ts">
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import zhTw from 'element-plus/es/locale/lang/zh-tw'
import en from 'element-plus/es/locale/lang/en'

</script>

<template>
  <ElConfigProvider :locale="$i18n.locale === 'zh-CN' ? zhCn : $i18n.locale === 'zh-TW' ? zhTw : en">
    <RouterView />
  </ElConfigProvider>
</template>
