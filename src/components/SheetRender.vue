<script setup lang="ts">
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import UniverPresetSheetsCoreEnUS from '@univerjs/preset-sheets-core/locales/en-US'
import UniverPresetSheetsCoreZhCN from '@univerjs/preset-sheets-core/locales/zh-CN'
import UniverPresetSheetsCoreZhTW from '@univerjs/preset-sheets-core/locales/zh-TW'
import type { FUniver, Univer } from '@univerjs/presets'
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'
import { useDark } from '@vueuse/core'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import '@univerjs/preset-sheets-core/lib/index.css'


const { locale } = useI18n({ useScope: 'global' })
const isDark = useDark()
const container = ref<HTMLElement | null>(null)

let univerInstance: Univer | null = null
let univerAPIInstance: FUniver | null = null

const locales: { [key: string]: LocaleType } = {
  'zh-CN': LocaleType.ZH_CN,
  'zh-TW': LocaleType.ZH_TW,
  'en-US': LocaleType.EN_US,
}

watch(isDark, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    univerAPIInstance?.toggleDarkMode(newVal)
  }
})

watch(locale, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    univerAPIInstance?.setLocale(locales[newVal] || LocaleType.ZH_CN)
  }
})

onMounted(() => {
  const { univer, univerAPI } = createUniver({
    locale: LocaleType.ZH_CN,
    locales: {
      [LocaleType.ZH_CN]: mergeLocales(
        UniverPresetSheetsCoreZhCN,
      ),
      [LocaleType.ZH_TW]: mergeLocales(
        UniverPresetSheetsCoreZhTW
      ),
      [LocaleType.EN_US]: mergeLocales(
        UniverPresetSheetsCoreEnUS
      ),
    },
    presets: [
      UniverSheetsCorePreset({
        container: container.value as HTMLElement,
      }),
    ]
  })

  univerAPI.createWorkbook({})

  univerInstance = univer
  univerAPIInstance = univerAPI
})

onBeforeUnmount(() => {
  univerInstance?.dispose()
  univerAPIInstance?.dispose()
  univerInstance = null
  univerAPIInstance = null
})
</script>

<template>
  <div ref="container" class="h-125" />
</template>