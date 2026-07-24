<template>
  <v-menu>
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        density="comfortable"
        :icon="loadIcon(globalIcons['translate'])"
      />
    </template>

    <v-list
      density="compact"
    >
      <v-list-item
        v-for="option in langOptions"
        :key="option.value"
        :active="locale === option.value"
        :title="option.label"
        @click="changeLocale(option.value)"
      />
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useLocale } from 'vuetify'
import { globalIcons } from '@/constants'
import { langOptions } from '@/lang'
import { useAppStore } from '@/stores/app'
import { loadIcon } from '@/utils'

const appStore = useAppStore()
const { locale } = useI18n({ useScope: 'global' })
locale.value = appStore.locale

const { current } = useLocale()

function changeLocale (lang: string) {
  current.value = lang
  locale.value = lang
  appStore.setLocale(lang)
}
</script>
