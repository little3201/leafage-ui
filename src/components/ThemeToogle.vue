<template>
  <v-btn
    density="comfortable"
    :icon="loadIcon(globalIcons[theme.current.value.dark ? 'dark' : 'light'])"
    @click="handleChange(!theme.current.value.dark)"
  />
</template>

<script setup lang="ts">
import { useTheme } from 'vuetify'
import { globalIcons } from '@/constants'
import { useAppStore } from '@/stores/app'
import { loadIcon } from '@/utils'

const theme = useTheme()
const appStore = useAppStore()

function handleChange (dark: boolean) {
  theme.change(dark ? 'dark' : 'light')
  appStore.setTheme(dark ? 'dark' : 'light')
}
</script>
