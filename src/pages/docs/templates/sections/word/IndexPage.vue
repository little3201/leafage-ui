<script setup lang="ts">
import type { IDocumentData } from '@univerjs/presets'
import DocRender from 'components/DocRender.vue'

defineProps<{
  title: string,
  data: Partial<IDocumentData>,
  readOnly?: boolean
}>()
</script>

<template>
  <DocRender :data="{ ...data, title: title }" :read-only="readOnly" />
</template>