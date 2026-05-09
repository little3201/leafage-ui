<script setup lang="ts">
import EditorJS from '@editorjs/editorjs'
import List from '@editorjs/list'
import Table from '@editorjs/table'
import { onMounted, ref } from 'vue'



const props = defineProps<{
  body: string | null
}>()

const editorRef = ref<HTMLDivElement>()
const editor = ref<EditorJS>()

onMounted(() => {
  if (editorRef.value) {
    editor.value = new EditorJS({
      holder: editorRef.value,
      placeholder: 'Type text or paste content here...',
      tools: {
        list: { class: List, inlineToolbar: true },
        table: Table
      },
      data: {
        blocks: [
          {
            type: 'paragraph',
            data: {
              text: props.body || ''
            }
          }
        ]
      }
    })
  }
})
</script>

<template>
  <ElCard shadow="never">
    <div ref="editorRef" class="w-full h-full"></div>
  </ElCard>
</template>