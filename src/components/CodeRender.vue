<script setup lang="ts">
import { computed } from 'vue'
import hljs from 'boot/hljs'
import type { HighlightResult } from 'highlight.js'
import 'highlight.js/styles/github-dark.min.css'

const props = defineProps<{
  content: string | undefined,
  language?: string | undefined
}>()

const highlightResult = computed<HighlightResult | null>(() => {
  if (!props.content) return null

  return props.language && hljs.getLanguage(props.language)
    ? hljs.highlight(props.content, { language: props.language })
    : hljs.highlightAuto(props.content)
})
</script>

<template>
  <pre v-if="content" class="relative my-0">
    <code class="hljs overflow-auto" v-html="highlightResult?.value"></code>
    <small class="absolute top-1 right-2 text-white">
      {{ highlightResult?.language }}
    </small>
  </pre>
  <ElEmpty v-else description="No Data" />
</template>
