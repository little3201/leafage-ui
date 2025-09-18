<script lang="ts" setup>
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
