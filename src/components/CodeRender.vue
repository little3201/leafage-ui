<template>
  <pre v-if="content" class="relative-position q-my-none" style="height: 600px;">
    <code class="hljs" v-html="highlightResult?.value"></code>
    <small class="absolute absolute-top-right text-white q-pr-sm q-pt-sm">
      {{ highlightResult?.language }}
    </small>
  </pre>
  <div v-else class="flex flex-center q-px-lg">
    <p class="text-h3">
      No Data
    </p>
  </div>
</template>

<script lang="ts" setup>
import hljs from 'boot/hljs'
import type { HighlightResult } from 'highlight.js'
import 'highlight.js/styles/github-dark.min.css'
import { computed } from 'vue'

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
