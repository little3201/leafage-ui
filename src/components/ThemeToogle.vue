<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { useDark, useToggle } from "@vueuse/core";
import { globalIcons } from "@/constants";
import { loadIcon } from "@/utils";
import Cookies from "js-cookie";

const isDark = useDark({
  storageKey: "theme",
  storage: {
    getItem(key) {
      return Cookies.get(key) ?? null;
    },

    setItem(key, value) {
      Cookies.set(key, value, {
        secure: true,
        sameSite: "Lax"
      });
    },

    removeItem(key) {
      Cookies.remove(key);
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
