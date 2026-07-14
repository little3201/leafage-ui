<script setup lang="ts">
import en from "element-plus/es/locale/lang/en";
import zhCN from "element-plus/es/locale/lang/zh-cn";
import zhTW from "element-plus/es/locale/lang/zh-tw";
import { computed } from "vue";
import { useAppStore } from "@/stores/app";

const appStore = useAppStore();
const locales: Record<string, typeof en> = {
  "en-US": en,
  "zh-CN": zhCN,
  "zh-TW": zhTW
};
const lang = computed(() => {
  return locales[appStore.locale];
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
