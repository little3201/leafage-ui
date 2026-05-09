<script setup lang="ts">
import { retrieveSectionDatas, retrieveSectionFields } from 'src/api/docs/sections'
import type { SectionField } from 'src/types'
import { ref, watch } from 'vue'


const props = defineProps<{
  sectionId: number
}>()

const fields = ref<Array<SectionField>>([])
const datas = ref<Array<Record<string, unknown>>>([])
const loading = ref(false)

watch(() => props.sectionId, async (newVal) => {
  if (!newVal) return

  await loadFields()
  await loadDatas()
}, { immediate: true })

async function loadFields() {
  if (!props.sectionId) return
  loading.value = true
  try {
    const res = await retrieveSectionFields(props.sectionId)
    fields.value = res.data
  } catch (error) {
    return error
  } finally {
    loading.value = false
  }
}

async function loadDatas() {
  if (!props.sectionId) return
  loading.value = true
  try {
    const res = await retrieveSectionDatas(props.sectionId)
    datas.value = res.data
  } catch (error) {
    return error
  } finally {
    loading.value = false
  }
}

function onclick() {
  datas.value.push({})
}
</script>

<template>
  <ElTable :data="datas" row-key="id" table-layout="auto">
    <ElTableColumn type="index" :label="$t('label.no')" width="55" />
    <ElTableColumn v-for="(field, index) in fields" :key="index" :prop="field.field" :label="field.name" />
  </ElTable>
  <ElButton v-if="fields && fields.length > 0" class="mt-4" type="primary" plain style="width: 100%" @click="onclick">
    Add Item
  </ElButton>
</template>