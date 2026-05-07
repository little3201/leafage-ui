<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type {
  FormInstance,
  TreeData, TreeInstance,
  TreeNodeData
} from 'element-plus'
import {
  createSection,
  fetchSection,
  modifySection,
  retrieveSectionTree
} from 'src/api/docs/sections'
import { actionIcons, actionTypes } from 'src/constants'
import type { Section } from 'src/types'
import { hasAction } from 'src/utils'
import { ref, watch } from 'vue'
import WordContent from '../../schemas/sections/WordContent.vue'


const props = defineProps<{
  archiveId: number
  preview?: boolean
}>()

const visible = ref<boolean>(false)
const saveLoading = ref<boolean>(false)

const treeRef = ref<TreeInstance>()
const treeData = ref<TreeData>([])
const treeLoading = ref<boolean>(false)
const treeSelected = ref<string>('')
const filterText = ref('')

const contentRef = ref<InstanceType<typeof WordContent>>()
const contentFormRef = ref<InstanceType<typeof WordContent>>()
const initialValues: Section = {
  id: null,
  name: '',
  ownerId: props.archiveId,
  ownerType: 'ARCHIVE',
  superiorId: null,
  type: 'HEADING',
  body: ''
}
const form = ref<Section>({ ...initialValues })

/**
 * 监听tree,archiveId
 */
watch(() => filterText.value, (newVal, oldVal) => {
  if (newVal === oldVal) return
  treeRef.value!.filter(newVal)
})
watch(() => props.archiveId, async () => {
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
  if (!props.archiveId) return
  treeLoading.value = true
  try {
    const res = await retrieveSectionTree(props.archiveId, 'ARCHIVE')
    treeData.value = res.data
  } catch (error) {
    return error
  } finally {
    treeLoading.value = false
  }
}

/**
 * 加载
 * @param id 主键
 */
async function loadOne(id: number) {
  try {
    const res = await fetchSection(id)
    form.value = res.data
  } catch (error) {
    return error
  }
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
 * 表单提交
 */
async function onSubmit() {
  const sectionFormEl = contentFormRef.value?.sectionFormRef
  if (!sectionFormEl) return

  const sectionForm = contentFormRef.value?.sectionForm
  if (!sectionForm) return

  await saveOrModify(sectionFormEl, sectionForm)
}

/**
 * 修改章节
 */
async function modifyArchiveSection() {
  const sectionFormEl = contentRef.value?.sectionFormRef
  if (!sectionFormEl) return

  const sectionForm = contentRef.value?.sectionForm
  if (!sectionForm) return

  await saveOrModify(sectionFormEl, sectionForm)
}

async function saveOrModify(sectionFormEl: FormInstance, sectionForm: Section) {
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
      return error
    }
  }
}

defineExpose({
  modifyArchiveSection
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
          <ElButton v-if="!props.preview && hasAction($route.name, 'create')" title="create" circle plain size="small"
            :type="actionTypes['create']" @click="saveRow()">
            <Icon :icon="`material-symbols:${actionIcons['create']}-rounded`" width="1.25em" height="1.25em" />
          </ElButton>
        </div>

        <ElTree ref="treeRef" :data="treeData" v-loading="treeLoading" node-key="id" :current-node-key="treeSelected"
          highlight-current :props="{ label: 'name' }" :filter-node-method="filterNode"
          @current-change="onCurrentChange">
        </ElTree>
      </ElCard>
    </ElCol>

    <ElCol :span="16" :xl="18">
      <ElCard v-if="props.preview" shadow="never">
        {{ form.body }}
      </ElCard>

      <WordContent ref="contentRef" v-else-if="treeSelected" :row="form" :is-new="false" />
    </ElCol>
  </ElRow>

  <!-- form -->
  <ElDialog v-model="visible" :title="$t('page.sections')" align-center :show-close="false" width="480">
    <WordContent ref="contentFormRef" :row="form" :is-new="true" />
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