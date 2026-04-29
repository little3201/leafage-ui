<script setup lang="ts">
import type { SectionField } from 'src/types'
import { ref } from 'vue'


const props = defineProps<{
  fields: SectionField[]
  rows: Record<string, unknown>[]
}>()

const datas = ref([...props.rows])

function onclick() {
  datas.value.push({})
}

</script>

<template>
  <div v-if="props.fields && props.fields.length > 0">
    <ElTable :data="datas" row-key="id" table-layout="auto">
      <ElTableColumn type="index" :label="$t('label.no')" width="55" />
      <ElTableColumn v-for="(field, index) in props.fields" :key="index" :prop="field.field" :label="field.name" />
    </ElTable>
    <ElButton class="mt-4" type="primary" plain style="width: 100%" @click="onclick">
      Add Item
    </ElButton>
  </div>
</template>