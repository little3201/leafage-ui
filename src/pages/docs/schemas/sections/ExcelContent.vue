<script setup lang="ts">
import type { TableInstance, UploadInstance } from 'element-plus'
import { retrieveSectionDatas, retrieveSectionFields } from 'src/api/docs/sections'
import { actionIcons, actionTypes } from 'src/constants'
import type { SectionField } from 'src/types'
import { exportToCSV } from 'src/utils'
import { ref, watch } from 'vue'


const props = defineProps<{
  sectionId: number
}>()

const tableRef = ref<TableInstance>()
const fields = ref<Array<SectionField>>([])
const datas = ref<Array<Record<string, unknown>>>([])

const importVisible = ref(false)
const importRef = ref<UploadInstance>()
const importLoading = ref(false)
const exportLoading = ref(false)

watch(() => props.sectionId, async (newVal) => {
  if (!newVal) return

  await loadFields()
  await loadDatas()
}, { immediate: true })

async function loadFields() {
  if (!props.sectionId) return

  const res = await retrieveSectionFields(props.sectionId)
  fields.value = res.data
}

async function loadDatas() {
  if (!props.sectionId) return

  const res = await retrieveSectionDatas(props.sectionId)
  datas.value = res.data
}

function saveRow() {
  datas.value.push({})
}

function importRows() {
  importVisible.value = true
}

function onImportSubmit(importEl: UploadInstance) {
  if (!importEl) return
  importLoading.value = true

  importEl.submit()

  importLoading.value = false
  importVisible.value = false
}

function exportRows() {
  exportLoading.value = true

  const selectedRows = tableRef.value?.getSelectionRows()
  if (selectedRows && selectedRows.length) {
    exportToCSV(selectedRows, 'datas')
  }
  exportLoading.value = false
}
</script>

<template>
  <ElRow :gutter="20" justify="space-between" class="mb-4">
    <ElCol :span="24" class="text-right">
      <ElButton title="create" :type="actionTypes['create']" @click="saveRow()">
        <Icon :icon="`material-symbols:${actionIcons['create']}-rounded`" width="1.25em" height="1.25em" />{{
          $t('action.create') }}
      </ElButton>
      <ElButton title="import" :type="actionTypes['import']" plain @click="importRows">
        <Icon :icon="`material-symbols:${actionIcons['import']}-rounded`" width="1.25em" height="1.25em" />{{
          $t('action.import')
        }}
      </ElButton>
      <ElButton title="export" :type="actionTypes['export']" plain @click="exportRows" :loading="exportLoading">
        <Icon :icon="`material-symbols:${actionIcons['export']}-rounded`" width="1.25em" height="1.25em" />{{
          $t('action.export')
        }}
      </ElButton>
    </ElCol>
  </ElRow>

  <ElTable ref="tableRef" :data="datas" row-key="id" table-layout="auto">
    <ElTableColumn type="selection" />
    <ElTableColumn type="index" :label="$t('label.no')" width="55" />
    <ElTableColumn v-for="(field, index) in fields" :key="index" :prop="field.field" :label="field.name">
      <template #default="scope">
        <ElInput v-model="scope.row.value" />
      </template>
    </ElTableColumn>
  </ElTable>

  <!-- import -->
  <ElDialog v-model="importVisible" :title="$t('action.import')" align-center :show-close="false" width="480">
    <ElUpload ref="importRef" :limit="1" drag :auto-upload="false" accept=".xls,.xlsx">
      <div class="el-icon--upload inline-flex justify-center">
        <Icon icon="material-symbols:upload-rounded" width="48" height="48" />
      </div>
      <div class="el-upload__text">
        {{ $t('tips.drop2Here') }}<em>{{ $t('tips.click2Upload') }}</em>
      </div>
      <template #tip>
        <div class="el-upload__tip">
          {{ $t('tips.fileSizeLimit', { size: '50MB' }) }}
        </div>
      </template>
    </ElUpload>

    <template #footer>
      <ElButton title="cancel" @click="importVisible = false">
        <Icon icon="material-symbols:close" width="1.25em" height="1.25em" />{{ $t('action.cancel') }}
      </ElButton>
      <ElButton title="submit" type="primary" :loading="importLoading" @click="onImportSubmit(importRef!)">
        <Icon icon="material-symbols:check-circle-outline-rounded" width="1.25em" height="1.25em" /> {{
          $t('action.submit') }}
      </ElButton>
    </template>
  </ElDialog>
</template>