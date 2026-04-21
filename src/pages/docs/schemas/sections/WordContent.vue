<script setup lang="ts">
import type {
  FormInstance,
  FormRules
} from 'element-plus'
import type { ArchiveSection, SchemaSection, Section } from 'src/types'
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'


const { t } = useI18n()
const props = defineProps<{
  row: Section | SchemaSection | ArchiveSection
  isNew?: boolean
}>()

const formRef = ref<FormInstance>()
const form = ref<Section | SchemaSection | ArchiveSection>({ ...props.row })

const rules = reactive<FormRules<typeof form>>({
  name: [
    { required: true, message: t('placeholder.inputText', { field: t('label.name') }), trigger: 'blur' }
  ]
})

defineExpose({
  formRef,
  form
})
</script>

<template>
  <ElForm ref="formRef" :model="form" :rules="rules" label-position="top">
    <ElRow :gutter="20">
      <ElCol>
        <ElFormItem :label="isNew ? $t('label.name') : ''" prop="name">
          <ElInput v-model="form.name" :placeholder="$t('placeholder.inputText', { field: $t('label.name') })" />
        </ElFormItem>
      </ElCol>
    </ElRow>
    <ElRow :gutter="20">
      <ElCol>
        <ElFormItem :label="isNew ? $t('label.body') : ''" prop="body">
          <ElInput v-model="form.body" type="textarea" :rows="isNew ? 6 : 20"
            :placeholder="$t('placeholder.inputText', { field: $t('label.body') })" />
        </ElFormItem>
      </ElCol>
    </ElRow>
  </ElForm>
</template>