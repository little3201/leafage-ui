<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { createSectionField, modifySectionField, removeSectionField, retrieveSectionFields } from 'src/api/docs/sections'
import { fieldTypes } from 'src/constants'
import type { SectionField } from 'src/types'
import { onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'


const { t } = useI18n()
const props = defineProps<{
  sectionId: number | null
  readOnly: boolean
}>()

const fields = ref<Array<SectionField>>([])
const editable = ref<Record<number, boolean>>({})
const loading = ref(false)
const saveLoading = ref(false)

const initialValues: SectionField = {
  id: null,
  sectionId: props.sectionId,
  name: '',
  type: '',
  field: '',
  length: 0,
  required: false
}

onMounted(async () => {
  await load()
})

watch(() => props.sectionId, async (newVal) => {
  if (!newVal) return

  await load()
})

async function load() {
  if (!props.sectionId) return
  loading.value = true

  try {
    const res = await retrieveSectionFields(props.sectionId)
    fields.value = res.data
  } catch (error) {
    fields.value = []

    throw error
  } finally {
    loading.value = false
  }
}

function addRow() {
  fields.value.push({ ...initialValues })
}

function modifyRow(id: number) {
  editable.value[id] = true
}

/**
 * 删除
 * @param id 主键
 * @param name 名称
 */
async function removeRow(id: number, name: string) {
  await ElMessageBox.confirm(
    t('tips.removeWarning', { module: t('action.field'), data: name }),
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
      await removeSectionField(id)
      await load()

      ElMessage.success(t('message.success', { action: t('action.remove') }))
    } catch (error) {
      ElMessage.error(t('message.error', { action: t('action.remove') }))
      throw error
    }
  })
}

/**
 * 表单提交
 */
async function confirmRow(row: SectionField) {
  if (!props.sectionId) return

  saveLoading.value = true
  try {
    row.sectionId = props.sectionId
    if (row.id) {
      await modifySectionField(row.id, row)
      editable.value[row.id] = false
    } else {
      await createSectionField(row)
    }
    await load()
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
  <ElTable v-loading="loading" :data="fields" row-key="id" table-layout="auto">
    <ElTableColumn type="index" :label="$t('label.no')" width="55" />
    <ElTableColumn prop="name" :label="$t('label.name')">
      <template #default="scope">
        <ElFormItem v-if="editable[scope.row.id]" :prop="`fields.${scope.$index}.name`"
          :rules="[{ required: true, trigger: 'blur' }]">
          <ElInput v-model="scope.row.name" style="width: 100px;" />
        </ElFormItem>
        <span v-else>{{ scope.row.name }}</span>
      </template>
    </ElTableColumn>
    <ElTableColumn prop="field" :label="$t('label.field')">
      <template #default="scope">
        <ElFormItem v-if="editable[scope.row.id]" :prop="`fields.${scope.$index}.field`"
          :rules="[{ required: true, trigger: 'blur' }]">
          <ElInput v-if="editable[scope.row.id]" v-model="scope.row.field" style="width: 100px;" />
          <span v-else>{{ scope.row.field }}</span>
        </ElFormItem>
      </template>
    </ElTableColumn>
    <ElTableColumn prop="type" :label="$t('label.type')">
      <template #default="scope">
        <ElFormItem v-if="editable[scope.row.id]" :prop="`fields.${scope.$index}.type`"
          :rules="[{ required: true, trigger: 'blur' }]">
          <ElSelect v-if="editable[scope.row.id]" v-model="scope.row.type" :disabled="scope.row.id !== null"
            :placeholder="$t('placeholder.selectText', { field: $t('label.type') })" style="width: 100px;">
            <ElOption v-for="(label, value) in fieldTypes" :key="value" :label="label" :value="value" />
          </ElSelect>
          <span v-else>{{ scope.row.type }}</span>
        </ElFormItem>
      </template>
    </ElTableColumn>
    <ElTableColumn prop="length" :label="$t('label.length')">
      <template #default="scope">
        <ElFormItem v-if="editable[scope.row.id]" :prop="`fields.${scope.$index}.length`"
          :rules="[{ required: true, trigger: 'blur' }]">
          <ElInput v-if="editable[scope.row.id]" v-model="scope.row.length" style="width: 100px;" />
        </ElFormItem>
        <span v-else>{{ scope.row.length }}</span>
      </template>
    </ElTableColumn>
    <ElTableColumn prop="required" :label="$t('label.required')">
      <template #default="scope">
        <ElSwitch :disabled="!editable[scope.row.id]" v-model="scope.row.required" />
      </template>
    </ElTableColumn>
    <ElTableColumn v-if="!readOnly" :label="$t('label.actions')">
      <template #default="scope">
        <div class="items-center w-15">
          <ElButton title="remove" circle size="small" type="danger" plain
            @click="removeRow(scope.row.id, scope.row.name)">
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
  <ElButton v-if="!readOnly" class="mt-4" type="primary" plain style="width: 100%" @click="addRow">
    {{ $t('action.addItem') }}
  </ElButton>
</template>