<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type {
  TreeData, TreeInstance, TreeNodeData
} from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  createSection,
  fetchSection,
  modifySection,
  removeSection,
  retrieveSectionTree
} from 'src/api/docs/sections'
import { actionIcons, actionTypes } from 'src/constants'
import type { Section } from 'src/types'
import { hasAction } from 'src/utils'
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import ExcelField from './ExcelField.vue'
import SectionContent from './SectionContent.vue'
import WordContent from './WordContent.vue'


const { t } = useI18n()
const props = defineProps<{
  ownerId: number
  ownerType: 'REPORT' | 'ARCHIVE' | 'SCHEMA'
  schemaType: 'WORD' | 'EXCEL'
}>()

const treeRef = ref<TreeInstance>()
const treeData = ref<TreeData>([])
const treeLoading = ref<boolean>(false)
const treeSelected = ref<string>('')
const filterText = ref('')

const saveLoading = ref<boolean>(false)
const visible = ref<boolean>(false)

const sectionContentRef = ref<InstanceType<typeof SectionContent>>()

const initialValues: Section = {
  id: null,
  ownerId: props.ownerId,
  ownerType: props.ownerType,
  name: '',
  superiorId: null,
  body: ''
}
const form = ref<Section>({ ...initialValues })

/**
 * 监听tree
 */
watch(() => filterText.value, (newVal, oldVal) => {
  if (newVal === oldVal) return
  treeRef.value!.filter(newVal)
})
watch(() => props.ownerId, async () => {
  treeSelected.value = ''
  form.value = { ...initialValues }
  await loadTree()
}, { immediate: true })

/**
 * tree过滤
 */
const filterNode = (value: string, data: { [key: string]: string }) => {
  if (!value) return true
  return data.name?.includes(value) ?? false
}

/**
 * node 变化
 * @param data node节点
 */
async function onCurrentChange(data: TreeNodeData) {
  if (treeSelected.value === String(data.id)) {
    return
  }
  treeSelected.value = String(data.id)
  await loadOne(data.id)
}

/**
 * 加载tree
 */
async function loadTree() {
  if (!props.ownerId) return
  treeLoading.value = true

  const res = await retrieveSectionTree(props.ownerId, props.ownerType)
  treeData.value = res.data

  treeLoading.value = false
}

/**
 * 新增、编辑弹出框
 * @param id 主键
 */
async function saveRow(id?: number) {
  form.value = { ...initialValues }
  if (id) {
    await loadOne(id)
  }
  visible.value = true
}

/**
 * 加载
 * @param id 主键
 */
async function loadOne(id: number) {
  const res = await fetchSection(id)
  form.value = res.data
}

/**
 * 表单提交
 */
async function onSubmit() {
  const sectionFormEl = sectionContentRef.value?.sectionFormRef
  if (!sectionFormEl) return

  const sectionForm = sectionContentRef.value?.sectionForm
  if (!sectionForm) return

  const valid = await sectionFormEl.validate()
  if (valid) {
    try {
      const { id } = sectionForm
      const superiorId = treeSelected.value ? Number(treeSelected.value) : null

      if (!id) sectionForm.superiorId = superiorId
      const node = superiorId ? treeRef.value?.getNode(superiorId) : null
      if (node) {
        sectionForm.level = node.level ?? 0 + 1
      } else {
        sectionForm.level = 1
      }

      const res = id
        ? await modifySection(id, sectionForm)
        : await createSection(sectionForm)
      visible.value = false

      ElMessage.success(t('message.success', { action: sectionForm.id ? t('action.modify') : t('action.create') }))
      if (id) {
        if (node) {
          Object.assign(node.data, res.data)
        }
      } else {
        if (superiorId && node) {
          treeRef.value?.append(res.data, node.data)
        } else {
          treeData.value.push(res.data)
        }
      }
    } catch (error) {
      ElMessage.error(t('message.error', { action: sectionForm.id ? t('action.modify') : t('action.create') }))
      throw error
    }
  }
}

/**
 * 修改章节内容
 */
async function modifySectionContent() {
  // word: body, excel: fields and datas
  await Promise.all([])
}

/**
 * 删除
 * @param id 主键
 */
async function removeRow(id: number) {
  // 弹出确认框
  await ElMessageBox.confirm(
    t('tips.removeConfirm'),
    t('tips.actionConfirm'),
    {
      confirmButtonType: 'danger',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await removeSection(id)
      const node = treeRef.value?.getNode(id)
      if (node) {
        treeRef.value?.remove(node?.data)
      }

      ElMessage.success(t('message.success', { action: t('action.remove') }))
    } catch (error) {
      ElMessage.error(t('message.error', { action: t('action.remove') }))
      throw error
    }
  })
}

defineExpose({
  modifySectionContent
})
</script>

<template>
  <ElRow :gutter="16">
    <ElCol :span="8" :xl="6">
      <ElCard shadow="never">
        <div class="flex items-center space-x-4 mb-4">
          <ElInput v-model="filterText" :placeholder="$t('action.search')" clearable>
            <template #prefix>
              <Icon :icon="`material-symbols:${actionIcons['search']}-rounded`" width="1.25em" height="1.25em" />
            </template>
          </ElInput>
          <ElButton v-if="hasAction($route.name, 'create')" title="create" circle plain size="small"
            :type="actionTypes['create']" @click="saveRow()">
            <Icon :icon="`material-symbols:${actionIcons['create']}-rounded`" width="1.25em" height="1.25em" />
          </ElButton>
        </div>

        <ElTree ref="treeRef" :data="treeData" v-loading="treeLoading" node-key="id" :current-node-key="treeSelected"
          highlight-current :filter-node-method="filterNode" @current-change="onCurrentChange">
          <template #default="{ data }">
            <div class="flex flex-1 items-center justify-between ">
              <span>{{ data.meta!.sequence! }}. {{ data.name }}</span>
              <div>
                <ElButton type="primary" link @click="saveRow(data.id)">
                  <Icon :icon="`material-symbols:${actionIcons['modify']}-rounded`" />
                </ElButton>
                <ElButton v-if="hasAction($route.name, 'remove')" title="remove" :type="actionTypes['remove']" link
                  @click="removeRow(data.id)">
                  <Icon :icon="`material-symbols:${actionIcons['remove']}-rounded`" />
                </ElButton>
              </div>
            </div>
          </template>
        </ElTree>
      </ElCard>
    </ElCol>

    <ElCol :span="16" :xl="18">
      <div v-if="treeSelected">
        <WordContent v-if="props.schemaType === 'WORD'" :body="form.body" />
        <ExcelField v-else :section-id="form.id!" />
      </div>
      <ElEmpty v-else />
    </ElCol>
  </ElRow>

  <!-- form -->
  <ElDialog v-model="visible" :title="form.id ? $t('action.modify') : $t('action.create')" align-center
    :show-close="false" width="400">
    <SectionContent ref="sectionContentRef" :row="form" />
    <template #footer>
      <ElButton title="cancel" @click="visible = false">
        <Icon icon="material-symbols:close" width="1.25em" height="1.25em" />{{ $t('action.cancel') }}
      </ElButton>
      <ElButton title="submit" type="primary" :loading="saveLoading" @click="onSubmit()">
        <Icon icon="material-symbols:check-circle-outline-rounded" width="1.25em" height="1.25em" /> {{
          $t('action.submit') }}
      </ElButton>
    </template>
  </ElDialog>
</template>