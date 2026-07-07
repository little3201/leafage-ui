<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { useDark, useToggle } from "@vueuse/core";
import { globalIcons } from "@/constants";
import { loadIcon } from "@/utils";

const isDark = useDark();
const toggleDark = useToggle(isDark);
</script>

<template>
  <ElButton title="theme" type="default" link @click="() => toggleDark()">
    <Icon
      :icon="loadIcon(globalIcons[isDark ? 'dark' : 'light'])"
      class="text-white"
      width="1.5em"
      height="1.5em"
    />
  </ElButton>
</template>
