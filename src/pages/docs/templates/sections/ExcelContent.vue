<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { createSectionData, modifySectionData, removeSectionData, retrieveSectionDatas, retrieveSectionFields } from 'src/api/docs/sections'
import type { SectionData, SectionField } from 'src/types'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'


const { t } = useI18n()

const props = defineProps<{
  sectionId: number | null
  readOnly: boolean
}>()

const fields = ref<Array<SectionField>>([])
const visibleFields = computed(() =>
  fields.value.filter(field => field.field !== 'id')
)
const datas = ref<Array<SectionData>>([])
const saveLoading = ref(false)
const editable = ref<Record<number, boolean>>({})

watch(() => props.sectionId, async (newVal, oldVal) => {
  if (newVal != null && newVal !== oldVal) {
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
  if (!props.sectionId) return

  const data: Record<string, unknown> = {}
  fields.value.forEach(field => {
    if (field.type === 'number') {
      data[field.field] = 0
    } else {
      data[field.field] = ''
    }
  })
  datas.value.push({ id: null, sectionId: props.sectionId, data })
}

function modifyRow(id: number) {
  editable.value[id] = true
}

async function removeRow(id: number) {
  await ElMessageBox.confirm(
    t('tips.removeWarning', { module: t('action.data'), data: id }),
    t('tips.confirm'),
    {
      dangerouslyUseHTMLString: true,
      showCancelButton: false,
      confirmButtonType: 'danger',
      confirmButtonClass: 'w-full',
      confirmButtonText: t('tips.removeButtonText'),
      type: 'warning'
    }
  ).then(async () => {
    try {
      await removeSectionData(id)
      await loadDatas()

      ElMessage.success(t('message.success', { action: t('action.remove') }))
    } catch (error) {
      ElMessage.error(t('message.error', { action: t('action.remove') }))
      throw error
    }
  })
}

async function confirmRow(row: SectionData) {
  if (!props.sectionId) return

  saveLoading.value = true
  try {
    row.sectionId = props.sectionId
    if (row.id) {
      await modifySectionData(row.id, row)
      editable.value[row.id] = false
    } else {
      const res = await createSectionData(row)
      editable.value[res.data.id] = false
    }
    await loadDatas()
    ElMessage.success(t('message.success', { action: row.id ? t('action.modify') : t('action.create') }))
  } catch (error) {
    ElMessage.error(t('message.error', { action: row.id ? t('action.modify') : t('action.create') }))
    throw error
  } finally {
    saveLoading.value = false
  }
}
</script>

<template>
  <ElTable :data="datas" row-key="id" table-layout="auto">
    <ElTableColumn type="selection" />
    <ElTableColumn type="index" :label="$t('label.no')" width="55" />
    <ElTableColumn v-for="(field, index) in visibleFields" :key="index" :prop="field.field" :label="field.name">
      <template #default="scope">
        <ElFormItem v-if="editable[scope.row.id]" :prop="`fields.${scope.$index}.${scope.row.data[field.field]}`"
          :rules="[{ required: scope.row.required, trigger: 'blur' }]">
          <ElInput v-model="scope.row.data[field.field]" />
        </ElFormItem>
        <span v-else>{{ scope.row.data[field.field] }}</span>
      </template>
    </ElTableColumn>
    <ElTableColumn v-if="!readOnly" :label="$t('label.actions')">
      <template #default="scope">
        <div class="items-center w-15">
          <ElButton title="remove" circle size="small" type="danger" plain @click="removeRow(scope.row.id)">
            <Icon icon="material-symbols:close" width="1.25em" height="1.25em" />
          </ElButton>
          <ElButton v-if="editable[scope.row.id]" v-loading="saveLoading" title="confirm" circle size="small"
            type="success" plain @click="confirmRow(scope.row)">
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