<script lang="ts" setup>
import { UniverDocsCorePreset } from '@univerjs/preset-docs-core'
import UniverPresetDocsCoreEnUS from '@univerjs/preset-docs-core/locales/en-US'
import UniverPresetDocsCoreZhCN from '@univerjs/preset-docs-core/locales/zh-CN'
import UniverPresetDocsCoreZhTW from '@univerjs/preset-docs-core/locales/zh-TW'
import { UniverDocsDrawingPreset } from '@univerjs/preset-docs-drawing'
import UniverPresetDocsDrawingEnUS from '@univerjs/preset-docs-drawing/locales/en-US'
import UniverPresetDocsDrawingZhCN from '@univerjs/preset-docs-drawing/locales/Zh-CN'
import UniverPresetDocsDrawingZhTW from '@univerjs/preset-docs-drawing/locales/ZH-TW'
import type { FUniver, IDocumentData, Univer } from '@univerjs/presets'
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'
import { useDark } from '@vueuse/core'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'


import '@univerjs/preset-docs-core/lib/index.css'

const props = defineProps<{
  data: Partial<IDocumentData>,
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

watch(() => props.data, (newVal, oldVal) => {
  if (!univerAPIInstance || !newVal) return
  //避免深度监听造成的死循环
  if (JSON.stringify(newVal) === JSON.stringify(oldVal)) return

  initUniver(newVal)
}, { deep: true })

/**
 * 创建 document
 * @param documentData document 
 */
function initUniver(documentData: Partial<IDocumentData>) {
  // 当前页面不重新创建
  const document = univerAPIInstance?.getActiveDocument()
  if (document && document.id === documentData.id) {
    return
  }

  if (univerInstance) {
    univerInstance.dispose()
    univerInstance = null
    univerAPIInstance = null
  }

  // 重新创建
  const { univer, univerAPI } = createUniver({
    darkMode: isDark.value,
    locale: locales[locale.value] || LocaleType.ZH_CN,
    locales: {
      [LocaleType.ZH_CN]: mergeLocales(UniverPresetDocsCoreZhCN, UniverPresetDocsDrawingZhCN),
      [LocaleType.ZH_TW]: mergeLocales(UniverPresetDocsCoreZhTW, UniverPresetDocsDrawingZhTW),
      [LocaleType.EN_US]: mergeLocales(UniverPresetDocsCoreEnUS, UniverPresetDocsDrawingEnUS)
    },
    presets: [
      UniverDocsCorePreset({
        container: container.value as HTMLElement,
        toolbar: !props.readOnly,
        contextMenu: !props.readOnly
      }),
      UniverDocsDrawingPreset()
    ]
  })

  univerAPI.createUniverDoc(documentData || {})

  univerInstance = univer
  univerAPIInstance = univerAPI
}

onMounted(() => {
  if (props.data) {
    initUniver(props.data)
  }
})

onBeforeUnmount(() => {
  univerAPIInstance?.dispose()
  univerInstance?.dispose()

  univerAPIInstance = null
  univerInstance = null
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