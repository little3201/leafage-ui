<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { retrieveSectionDatas, retrieveSectionFields } from 'src/api/docs/sections'
import type { SectionField } from 'src/types'
import { computed, ref, watch } from 'vue'


const props = defineProps<{
  sectionId: number
  readOnly: boolean
}>()

const fields = ref<Array<SectionField>>([])
const visibleFields = computed(() =>
  fields.value.filter(field => field.field !== 'id')
)
const datas = ref<Array<Record<string, unknown>>>([])
const editable = ref<Record<number, boolean>>({})

watch(() => props.sectionId, async (newVal) => {
  if (newVal) {
    await loadFields()
    await loadDatas()
  }
}, { immediate: true })

async function loadFields() {
  if (!props.sectionId) return

  try {
    const res = await retrieveSectionFields(props.sectionId)
    fields.value = res.data
  } catch (error) {
    fields.value = []
    throw error
  }
}

async function loadDatas() {
  if (!props.sectionId) return

  try {
    const res = await retrieveSectionDatas(props.sectionId)
    datas.value = res.data
  } catch (error) {
    datas.value = []
    throw error
  }
}

function addRow() {
  const data: Record<string, unknown> = {}
  fields.value.forEach(field => {
    if (field.type === 'number') {
      data[field.field] = 0
    } else {
      data[field.field] = ''
    }
  })
  datas.value.push(data)
}

function modifyRow(id: number) {
  editable.value[id] = true
}

function removeRow(index: number) {
  if (datas.value.length > 0) {
    datas.value.splice(index, 1)
  }
}

function confirmRow(id: number) {
  editable.value[id] = false
}
</script>

<template>
  <ElTable :data="datas" row-key="id" table-layout="auto">
    <ElTableColumn type="selection" />
    <ElTableColumn type="index" :label="$t('label.no')" width="55" />
    <ElTableColumn v-for="(field, index) in visibleFields" :key="index" :prop="field.field" :label="field.name">
      <template #default="scope">
        <ElInput v-if="editable[scope.row.id]" v-model="scope.row[field.field]" />
        <span v-else>{{ scope.row[field.field] }}</span>
      </template>
    </ElTableColumn>
    <ElTableColumn v-if="!readOnly" :label="$t('label.actions')">
      <template #default="scope">
        <div class="items-center w-15">
          <ElButton title="remove" circle size="small" type="danger" plain @click="removeRow(scope.$index)">
            <Icon icon="material-symbols:close" width="1.25em" height="1.25em" />
          </ElButton>
          <ElButton v-if="editable[scope.row.id]" title="confirm" circle size="small" type="success" plain
            @click="confirmRow(scope.row.id)">
            <Icon icon="material-symbols:check-rounded" width="1.25em" height="1.25em" />
          </ElButton>
          <ElButton v-else title="modify" circle size="small" type="primary" plain @click="modifyRow(scope.row.id)">
            <Icon icon="material-symbols:edit-outline-rounded" width="1.25em" height="1.25em" />
          </ElButton>
        </div>
      </template>
    </ElTableColumn>
  </ElTable>
  <ElButton v-if="!readOnly && fields.length > 1" class="mt-4" type="primary" plain style="width: 100%" @click="addRow">
    {{ $t('action.addItem') }}
  </ElButton>
</template>