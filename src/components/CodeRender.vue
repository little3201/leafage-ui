<script setup lang="ts">
import { ref, onUnmounted, watchEffect } from 'vue'
import hljs from 'boot/hljs'
import type { HighlightResult } from 'highlight.js'
import 'highlight.js/styles/github-dark.min.css'

const props = defineProps<{
  content: string | undefined,
  language?: string | undefined
}>()

const highlightResult = ref<HighlightResult | null>(null)

watchEffect(() => {
  highlightResult.value = props.content ? props.language && hljs.getLanguage(props.language)
    ? hljs.highlight(props.content, { language: props.language })
    : hljs.highlightAuto(props.content)
    : null
})

onUnmounted(() => { highlightResult.value = null })
</script>

<template>
  <pre v-if="content" class="relative my-0 whitespace-pre-line">
    <code class="hljs overflow-auto" v-html="highlightResult?.value"></code>
    <small class="absolute -top-1 right-2 text-white">
      {{ highlightResult?.language }}
    </small>
  </pre>
  <ElEmpty v-else description="No Data" />
</template>
