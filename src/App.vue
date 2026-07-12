<script setup lang="ts">
import en from "element-plus/es/locale/lang/en";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import zhTw from "element-plus/es/locale/lang/zh-tw";
import { computed } from "vue";
import { useAppStore } from "@/stores/app";

const appStore = useAppStore();

const lang = computed(() => {
  switch (appStore.locale) {
    case "zh-CN":
      return zhCn;
    case "zh-TW":
      return zhTw;
    case "en-US":
      return en;
    default:
      return zhCn;
  }
});
</script>

<template>
  <ElConfigProvider
    :locale="lang"
    :card="{ shadow: 'never' }"
    :dialog="{ alignCenter: true }"
  >
    <RouterView />
  </ElConfigProvider>
</template>
