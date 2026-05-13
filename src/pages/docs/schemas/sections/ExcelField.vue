<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { createSectionField, modifySectionField, retrieveSectionFields } from 'src/api/docs/sections'
import { retrieveDictionarySubset } from 'src/api/system/dictionaries'
import type { Dictionary, SectionField } from 'src/types'
import { onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'


const { t } = useI18n()
const props = defineProps<{
  sectionId: number
}>()

const fields = ref<Array<SectionField>>([])
const loading = ref(false)
const saveLoading = ref(false)
const typeOptions = ref<Array<Dictionary>>([])

const visible = ref(false)

const formRef = ref<FormInstance>()
const initialValues: SectionField = {
  id: null,
  sectionId: props.sectionId,
  name: '',
  type: '',
  field: '',
  length: 0
}
const form = ref<SectionField>({ ...initialValues })

const rules = reactive<FormRules<typeof form>>({
  name: [
    { required: true, message: t('placeholder.inputText', { field: t('label.name') }), trigger: 'blur' }
  ],
  type: [
    { required: true, message: t('placeholder.inputText', { field: t('label.type') }), trigger: 'blur' }
  ],
  field: [
    { required: true, message: t('placeholder.inputText', { field: t('label.field') }), trigger: 'blur' }
  ],
  length: [
    { required: true, message: t('placeholder.inputText', { field: t('label.length') }), trigger: 'blur' }
  ]
})

onMounted(async () => {
  await load()

  const res = await retrieveDictionarySubset(100)
  typeOptions.value = res.data
})

watch(() => props.sectionId, async (newVal) => {
  if (!newVal) return

  await load()
})

async function load() {
  if (!props.sectionId) return
  loading.value = true

  const res = await retrieveSectionFields(props.sectionId)
  fields.value = res.data

  loading.value = false
}

function onclick() {
  visible.value = true
  form.value = {
    ...initialValues,
    sectionId: props.sectionId || 0
  }
}

/**
 * 表单提交
 */
async function onSubmit(formEl: FormInstance) {
  if (!formEl) return
  const valid = await formEl.validate()
  if (valid) {
    saveLoading.value = true
    try {
      if (form.value.id) {
        await modifySectionField(form.value.id, form.value)
      } else {
        await createSectionField(form.value)
      }
      visible.value = false

      ElMessage.success(t('message.success', { action: form.value.id ? t('action.modify') : t('action.create') }))
      await load()
    } catch (error) {
      ElMessage.error(t('message.error', { action: form.value.id ? t('action.modify') : t('action.create') }))
      throw error
    } finally {
      saveLoading.value = false
    }
  }
}
</script>

<template>
  <ElTable v-loading="loading" :data="fields" row-key="id" table-layout="auto">
    <ElTableColumn type="index" :label="$t('label.no')" width="55" />
    <ElTableColumn prop="name" :label="$t('label.name')" />
    <ElTableColumn prop="field" :label="$t('label.field')" />
    <ElTableColumn prop="type" :label="$t('label.type')" />
    <ElTableColumn prop="length" :label="$t('label.length')" />
  </ElTable>
  <ElButton class="mt-4" type="primary" plain style="width: 100%" @click="onclick">
    Add Item
  </ElButton>

  <!-- fields -->
  <ElDialog v-model="visible" :title="$t('action.fields')" align-center :show-close="false" width="480">
    <ElForm ref="formRef" :model="form" :rules="rules" label-position="top">
      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem :label="$t('label.name')" prop="name">
            <ElInput v-model="form.name" :placeholder="$t('placeholder.inputText', { field: $t('label.name') })" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem :label="$t('label.field')" prop="field">
            <ElInput v-model="form.field" :placeholder="$t('placeholder.inputText', { field: $t('label.field') })" />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem :label="$t('label.type')" prop="type">
            <ElSelect v-model="form.type" :disabled="form.id !== null"
              :placeholder="$t('placeholder.selectText', { field: $t('label.type') })">
              <ElOption v-for="(item, index) in typeOptions" :key="index" :label="item.name" :value="item.name" />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem :label="$t('label.length')" prop="length">
            <ElInputNumber v-model="form.length"
              :placeholder="$t('placeholder.inputText', { field: $t('label.length') })" />
          </ElFormItem>
        </ElCol>
      </ElRow>
    </ElForm>
    <template #footer>
      <ElButton title="cancel" @click="visible = false">
        <Icon icon="material-symbols:close" width="1.25em" height="1.25em" />{{ $t('action.cancel') }}
      </ElButton>
      <ElButton title="submit" type="primary" :loading="saveLoading" @click="onSubmit(formRef!)">
        <Icon icon="material-symbols:check-circle-outline-rounded" width="1.25em" height="1.25em" /> {{
          $t('action.submit') }}
      </ElButton>
    </template>
  </ElDialog>
</template>