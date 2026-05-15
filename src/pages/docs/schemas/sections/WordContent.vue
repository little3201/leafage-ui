<script setup lang="ts">
import type { OutputData } from '@editorjs/editorjs'
import EditorJS from '@editorjs/editorjs'
import List from '@editorjs/list'
import Table from '@editorjs/table'
import { watch } from 'vue'


const props = defineProps<{
  body: string | null
  readOnly: boolean
}>()

const editor = new EditorJS({
  holder: 'editorjs',
  placeholder: 'Type text or paste content here...',
  tools: {
    list: { class: List, inlineToolbar: true },
    table: Table
  },
  readOnly: props.readOnly
})

watch(() => props.body, async (newVal) => {
  if (editor) {
    const data: OutputData = {
      blocks: newVal ? JSON.parse(newVal) : []
    }
    await editor.isReady
    await editor.render(data)
  }
}, { immediate: true })

async function saveData() {
  if (editor) {
    const output = await editor.save()
    return output.blocks
  }
  return []
}

defineExpose({
  saveData
})
</script>

<template>
  <ElCard shadow="never">
    <div id="editorjs" class="w-full h-full"></div>
  </ElCard>
</template>