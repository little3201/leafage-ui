<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useDark, useToggle } from '@vueuse/core'


const isDark = useDark()
const toggleDark = useToggle(isDark)
</script>

<template>
  <ElButton title="theme" type="default" link @click="() => toggleDark()">
    <Icon :icon="isDark ? 'material-symbols:dark-mode-outline-rounded' : 'material-symbols:light-mode-outline-rounded'"
      class="text-white" width="1.5em" height="1.5em" />
  </ElButton>
</template>
