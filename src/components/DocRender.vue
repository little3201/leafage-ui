<script lang="ts" setup>
import { UniverDocsCorePreset } from '@univerjs/preset-docs-core'
import UniverPresetDocsCoreEnUS from '@univerjs/preset-docs-core/locales/en-US'
import UniverPresetDocsCoreZhCN from '@univerjs/preset-docs-core/locales/zh-CN'
import UniverPresetDocsCoreZhTW from '@univerjs/preset-docs-core/locales/zh-TW'
import type { FUniver, IDocumentData, Univer } from '@univerjs/presets'
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'
import { useDark } from '@vueuse/core'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'


import '@univerjs/preset-docs-core/lib/index.css'

const props = defineProps<{
  data: IDocumentData | undefined,
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

  // const document = univerAPIInstance.getActiveDocument()
  // if (!document) return

  // const snapshot = document.getSnapshot()
  // const textLength = snapshot.body?.dataStream.length || 0
  // if (textLength > 0) {
  //   document.setSelection(0, textLength - 1)
  //   // 触发内部删除指令
  //   await univerAPIInstance.executeCommand('doc.command.delete-left')
  // }

  // await document.appendText(newVal.body?.dataStream || '')
  initUniver(newVal)
}, { deep: true })


function initUniver(documentData: IDocumentData) {
  // 如果之前有实例，先彻底销毁核心实例和API实例
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
      [LocaleType.ZH_CN]: mergeLocales(UniverPresetDocsCoreZhCN),
      [LocaleType.ZH_TW]: mergeLocales(UniverPresetDocsCoreZhTW),
      [LocaleType.EN_US]: mergeLocales(UniverPresetDocsCoreEnUS)
    },
    presets: [
      UniverDocsCorePreset({
        container: container.value as HTMLElement
      })
    ]
  })

  univerAPI.createUniverDoc(documentData.body ? documentData : {})

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