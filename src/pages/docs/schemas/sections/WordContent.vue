<script setup lang="ts">
import EditorJS from '@editorjs/editorjs'
import List from '@editorjs/list'
import Table from '@editorjs/table'
import type {
  FormInstance,
  FormRules
} from 'element-plus'
import type { Section } from 'src/types'
import { nextTick, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'


const { t } = useI18n()

const props = defineProps<{
  row: Section
  isNew?: boolean
}>()

const editorRef = ref<HTMLDivElement>()

const sectionFormRef = ref<FormInstance>()
const sectionForm = ref<Section>({ ...props.row })

const rules = reactive<FormRules<typeof sectionForm>>({
  name: [
    { required: true, message: t('placeholder.inputText', { field: t('label.name') }), trigger: 'blur' }
  ]
})

onMounted(() => {
  if (editorRef.value) {
    new EditorJS({
      holder: editorRef.value,
      tools: {
        list: { class: List, inlineToolbar: true },
        table: Table
      },
      data: {
        blocks: [
          {
            type: 'paragraph',
            data: {
              text: sectionForm.value.body || ''
            }
          }
        ]
      }
    })
  }
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
        <ElCard shadow="never">
          <div ref="editorRef" class="w-full h-full"></div>
        </ElCard>
      </ElCol>
    </ElRow>
  </ElForm>
</template>