<script setup lang="ts">
import type { OutputData } from '@editorjs/editorjs'
import EditorJS from '@editorjs/editorjs'
import Image from '@editorjs/image'
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
const editor = ref()


onMounted(async () => {
  await nextTick()

  editor.value = new EditorJS({
    holder: editorRef.value,
    placeholder: 'Type text or paste content here...',
    readOnly: props.readOnly,

    tools: {
      list: {
        class: List,
        inlineToolbar: true
      },
      image: {
        class: Image,
        inlineToolbar: true
      },
      table: Table
    }
  })

  await editor.value.isReady

  if (props.body) {
    const data: OutputData = {
      time: Date.now(),
      blocks: JSON.parse(props.body),
      version: '2.31.6'
    }

    await editor.value.render(data)
  }
})

onBeforeUnmount(() => {
  editor.value?.destroy()
  editor.value = null
})

watch(
  () => props.body,
  async (newVal) => {
    if (!editor.value || !newVal) return

    await editor.value.isReady

    const data: OutputData = {
      time: Date.now(),
      blocks: JSON.parse(newVal),
      version: '2.31.6'
    }

    await editor.value.render(data)
  }
)

async function saveData() {
  if (!editor.value) return []

  await editor.value.isReady

  const output = await editor.value.save()

  return output.blocks
}

defineExpose({
  saveData
})
</script>

<template>
  <ElCard>
    <div ref="editorRef" class="w-full h-full"></div>
  </ElCard>
</template>