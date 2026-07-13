<script setup lang="ts">
import en from "element-plus/es/locale/lang/en";
import zhCN from "element-plus/es/locale/lang/zh-cn";
import zhTW from "element-plus/es/locale/lang/zh-tw";
import { computed } from "vue";
import { useAppStore } from "@/stores/app";

const appStore = useAppStore();

const lang = computed(() => {
  switch (appStore.locale) {
    case "zh-CN":
      return zhCN;
    case "zh-TW":
      return zhTW;
    case "en-US":
      return en;
    default:
      return zhCN;
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
