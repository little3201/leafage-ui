<script setup lang="ts">
import { useDark, useToggle } from '@vueuse/core'
import { Icon } from '@iconify/vue'


const isDark = useDark()
const toggleDark = useToggle(isDark)
</script>

<template>
  <ElButton title="theme" type="default" link @click="() => toggleDark()">
    <Icon :icon="isDark ? 'material-symbols:dark-mode-outline-rounded' : 'material-symbols:light-mode-outline-rounded'"
      class="text-white" width="22" height="22" />
  </ElButton>
</template>
