<script setup lang="ts">
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import UniverPresetSheetsCoreEnUS from '@univerjs/preset-sheets-core/locales/en-US'
import UniverPresetSheetsCoreZhCN from '@univerjs/preset-sheets-core/locales/zh-CN'
import UniverPresetSheetsCoreZhTW from '@univerjs/preset-sheets-core/locales/zh-TW'
import type { FUniver, IWorkbookData, Univer } from '@univerjs/presets'
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'
import { useDark } from '@vueuse/core'
import type { Ref } from 'vue'
import { inject, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import '@univerjs/preset-sheets-core/lib/index.css'

const props = defineProps<{
  data: Partial<IWorkbookData>,
  readOnly?: boolean
}>()

const { locale } = useI18n({ useScope: 'global' })
const isDark = useDark()
const container = ref<HTMLElement | null>(null)

const saveMethod = inject<Ref<(() => unknown) | undefined>>('saveData')

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
 * 创建 workbook
 * @param workbookData workbook 
 */
function initUniver(workbookData: Partial<IWorkbookData>) {
  // 当前页面不重新创建
  const workbook = univerAPIInstance?.getActiveWorkbook()
  if (workbook && workbook.id === workbookData.id) {
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
      [LocaleType.ZH_CN]: mergeLocales(
        UniverPresetSheetsCoreZhCN,
      ),
      [LocaleType.ZH_TW]: mergeLocales(
        UniverPresetSheetsCoreZhTW
      ),
      [LocaleType.EN_US]: mergeLocales(
        UniverPresetSheetsCoreEnUS
      )
    },
    presets: [
      UniverSheetsCorePreset({
        container: container.value as HTMLElement,
        toolbar: !props.readOnly,
        contextMenu: !props.readOnly
      })
    ]
  })

  univerAPI.createWorkbook(workbookData || {})

  univerInstance = univer
  univerAPIInstance = univerAPI
}

onMounted(() => {
  if (props.data) {
    initUniver(props.data)
  }
  if (univerAPIInstance && saveMethod) {
    saveMethod.value = save
  }
})

onBeforeUnmount(() => {
  univerInstance?.dispose()
  univerAPIInstance?.dispose()

  univerInstance = null
  univerAPIInstance = null
})

function save() {
  if (!univerAPIInstance) return

  const workbook = univerAPIInstance.getActiveWorkbook()
  if (!workbook) return

  return workbook.save()
}
</script>

<template>
  <div ref="container" class="h-125" />
</template>