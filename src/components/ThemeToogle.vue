<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { useDark, useToggle } from "@vueuse/core";
import { globalIcons } from "@/constants";
import { loadIcon } from "@/utils";
import { useAppStore } from "@/stores/app";

const appStore = useAppStore();
const isDark = useDark({
  storageKey: "theme",
  storage: {
    getItem() {
      return appStore.theme;
    },

    setItem(_key, value) {
      appStore.setTheme(value);
    },

    removeItem() {
      appStore.setTheme("");
    }
  }
});
const toggleDark = useToggle(isDark);
</script>

<template>
  <ElButton title="theme" link @click="() => toggleDark()">
    <Icon
      :icon="loadIcon(globalIcons[isDark ? 'dark' : 'light'])"
      class="text-white"
      width="1.5em"
      height="1.5em"
    />
  </ElButton>
</template>
