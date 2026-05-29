<script lang="ts" setup>
import { UniverDocsCorePreset } from '@univerjs/preset-docs-core'
import UniverPresetDocsCoreEnUS from '@univerjs/preset-docs-core/locales/en-US'
import UniverPresetDocsCoreZhCN from '@univerjs/preset-docs-core/locales/zh-CN'
import UniverPresetDocsCoreZhTW from '@univerjs/preset-docs-core/locales/zh-TW'
import type { FUniver, IDocumentBody, Univer } from '@univerjs/presets'
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'
import { useDark } from '@vueuse/core'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'


import '@univerjs/preset-docs-core/lib/index.css'

const props = defineProps<{
  data: IDocumentBody,
  readOnly?: boolean
}>()

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

watch(() => props.data.dataStream, async (newVal, oldVal) => {
  if (!newVal || !univerAPIInstance) return

  const document = univerAPIInstance.getActiveDocument()
  // 设置光标
  document?.setSelection(0, oldVal?.length ?? 1)
  // 删除历史数据
  await univerAPIInstance.executeCommand('doc.command.delete-left')
  // 添加新数据
  await document?.appendText(newVal)
})

onMounted(() => {
  const { univer, univerAPI } = createUniver({
    darkMode: isDark.value,
    locale: locales[locale.value] || LocaleType.ZH_CN,
    locales: {
      [LocaleType.ZH_CN]: mergeLocales(
        UniverPresetDocsCoreZhCN,
      ),
      [LocaleType.ZH_TW]: mergeLocales(
        UniverPresetDocsCoreZhTW
      ),
      [LocaleType.EN_US]: mergeLocales(
        UniverPresetDocsCoreEnUS
      )
    },
    presets: [
      UniverDocsCorePreset({
        container: container.value as HTMLElement
      })
    ]
  })

  univerAPI.createUniverDoc({})

  univerInstance = univer
  univerAPIInstance = univerAPI
})

onBeforeUnmount(() => {
  univerInstance?.dispose()
  univerAPIInstance?.dispose()
  univerInstance = null
  univerAPIInstance = null
})

function save() {
  if (!univerAPIInstance) return

  const document = univerAPIInstance.getActiveDocument()
  if (!document) return

  return document.getSnapshot()
}

defineExpose({
  save
})
</script>

<template>
  <div ref="container" class="h-125" />
</template>