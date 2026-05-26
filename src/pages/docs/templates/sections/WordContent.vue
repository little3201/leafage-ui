<script setup lang="ts">
import type { OutputData } from '@editorjs/editorjs'
import EditorJS from '@editorjs/editorjs'
import List from '@editorjs/list'
import Table from '@editorjs/table'
import {
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch
} from 'vue'

const props = defineProps<{
  body: string | null
  readOnly: boolean
}>()

const editorRef = ref<HTMLElement>()
let editor: EditorJS | null = null


onMounted(async () => {
  await nextTick()

  editor = new EditorJS({
    holder: editorRef.value!,
    placeholder: 'Type text or paste content here...',
    readOnly: props.readOnly,

    tools: {
      list: {
        class: List,
        inlineToolbar: true
      },
      table: Table
    }
  })

  await editor.isReady

  if (props.body) {
    const data: OutputData = {
      time: Date.now(),
      blocks: JSON.parse(props.body),
      version: '2.30.0'
    }

    await editor.render(data)
  }
})

onBeforeUnmount(() => {
  editor?.destroy()
  editor = null
})

watch(
  () => props.body,
  async (newVal) => {
    if (!editor || !newVal) return

    await editor.isReady

    const data: OutputData = {
      time: Date.now(),
      blocks: JSON.parse(newVal),
      version: '2.31.6'
    }

    await editor.render(data)
  }
)

async function saveData() {
  if (!editor) return []

  await editor.isReady

  const output = await editor.save()

  return output.blocks
}

defineExpose({
  saveData
})
</script>

<template>
  <ElCard shadow="never">
    <div ref="editorRef" class="w-full h-full"></div>
  </ElCard>
</template>