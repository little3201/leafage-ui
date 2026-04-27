<script setup lang="ts">
import type {
  FormInstance,
  FormRules
} from 'element-plus'
import type { ArchiveSection, SchemaSection, Section } from 'src/types'
import { nextTick, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'


const { t } = useI18n()
const props = defineProps<{
  row: Section | SchemaSection | ArchiveSection
  isNew?: boolean
}>()

const sectionFormRef = ref<FormInstance>()
const sectionForm = ref<Section | SchemaSection | ArchiveSection>({ ...props.row })

const rules = reactive<FormRules<typeof sectionForm>>({
  name: [
    { required: true, message: t('placeholder.inputText', { field: t('label.name') }), trigger: 'blur' }
  ]
})

watch(() => props.row, async (newVal) => {
  if (newVal) {
    await nextTick(() => {
      sectionForm.value = { ...newVal }

      if (sectionFormRef.value) {
        sectionFormRef.value.resetFields()
      }
    })
  }
})

defineExpose({
  sectionFormRef,
  sectionForm
})
</script>

<template>
  <ElForm ref="sectionFormRef" :model="sectionForm" :rules="rules" label-position="top">
    <ElRow :gutter="20">
      <ElCol :span="10">
        <ElFormItem :label="isNew ? $t('label.no') : ''" prop="sequence">
          <ElInputNumber v-model="sectionForm.sequence"
            :placeholder="$t('placeholder.inputText', { field: $t('label.no') })" />
        </ElFormItem>
      </ElCol>
      <ElCol :span="14">
        <ElFormItem :label="isNew ? $t('label.name') : ''" prop="name">
          <ElInput v-model="sectionForm.name" :placeholder="$t('placeholder.inputText', { field: $t('label.name') })" />
        </ElFormItem>
      </ElCol>
    </ElRow>
    <ElRow :gutter="20" v-if="!isNew">
      <ElCol>
        <ElFormItem prop="body">
          <ElInput v-model="sectionForm.body" type="textarea" :rows="20"
            :placeholder="$t('placeholder.inputText', { field: $t('label.body') })" />
        </ElFormItem>
      </ElCol>
    </ElRow>
  </ElForm>
</template>