<template>
  <router-view />
</template>

<script setup lang="ts">
import { useQuasar } from "quasar";
import type { QuasarLanguage } from "quasar";
import zhCN from "quasar/lang/zh-CN";
import zhTW from "quasar/lang/zh-TW";
import enUS from "quasar/lang/en-US";
import { useAppStore } from "@/stores/app";
import { storeToRefs } from "pinia";
import { watch } from "vue";

const $q = useQuasar();

const appStore = useAppStore();
const { locale } = storeToRefs(appStore);
const locales: Record<string, typeof zhCN | typeof zhTW | typeof enUS> = {
  "en-US": enUS,
  "zh-CN": zhCN,
  "zh-TW": zhTW
};

// init the language
$q.lang.set(locales[locale.value] as QuasarLanguage);
watch(locale, async val => {
  $q.lang.set(locales[val] as QuasarLanguage);
});
</script>
