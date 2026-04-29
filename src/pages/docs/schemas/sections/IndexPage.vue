<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type {
  FormInstance,
  TreeData, TreeInstance, TreeNodeData
} from 'element-plus'
import {
  createSection,
  fetchSection,
  modifySection,
  retrieveSectionTree
} from 'src/api/sections'
import { actionIcons, actionTypes } from 'src/constants'
import type { Section } from 'src/types'
import { hasAction } from 'src/utils'
import { ref, watch } from 'vue'
import ExcelContent from './ExcelContent.vue'
import WordContent from './WordContent.vue'


const props = defineProps<{
  schemaId: number
  schemaType: string
  preview?: boolean
}>()

const treeRef = ref<TreeInstance>()
const treeData = ref<TreeData>([])
const treeLoading = ref<boolean>(false)
const treeSelected = ref<string>('')
const filterText = ref('')

const saveLoading = ref<boolean>(false)
const visible = ref<boolean>(false)

const wordRef = ref<InstanceType<typeof WordContent>>()
const excelRef = ref<InstanceType<typeof ExcelContent>>()
const wordFormRef = ref<InstanceType<typeof WordContent>>()
const excelFormRef = ref<InstanceType<typeof ExcelContent>>()

const initialValues: Section = {
  id: null,
  ownerId: props.schemaId,
  ownerType: 'SCHEMA',
  name: '',
  superiorId: null,
  type: 'HEADING',
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
watch(() => props.schemaId, async () => {
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
  if (!props.schemaId) return
  treeLoading.value = true
  try {
    const res = await retrieveSectionTree(props.schemaId, 'SCHEMA')
    treeData.value = res.data
  } catch (error) {
    return error
  } finally {
    treeLoading.value = false
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
 * 表单提交
 */
async function onSubmit(type: string = 'WORD') {
  const sectionFormEl = type === 'WORD' ? wordFormRef.value?.sectionFormRef : excelFormRef.value?.sectionFormRef
  if (!sectionFormEl) return

  const sectionForm = type === 'WORD' ? wordFormRef.value?.sectionForm : excelFormRef.value?.sectionForm
  if (!sectionForm) return

  await saveOrModify(sectionFormEl, sectionForm)
}

/**
 * 修改章节
 */
async function modifySchemaSection(type: string = 'WORD') {
  const sectionFormEl = type === 'WORD' ? wordRef.value?.sectionFormRef : excelRef.value?.sectionFormRef
  if (!sectionFormEl) return

  const sectionForm = type === 'WORD' ? wordRef.value?.sectionForm : excelRef.value?.sectionForm
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

/**
 * 删除
 * @param id 主键
 */
// async function removeRow(id: number) {
//   try {
//     await removeSchemaSection(id)
//     const node = treeRef.value?.getNode(id)
//     if (node) {
//       treeRef.value?.remove(node?.data)
//     }
//   } catch (error) {
//     return error
//   }
// }

/**
 * 确认
 * @param id 主键
 */
// async function confirmEvent(id: number) {
//   await removeRow(id)
// }

defineExpose({
  modifySchemaSection
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
      <div v-if="props.preview">
        <ElCard v-if="props.schemaType === 'WORD'" shadow="never">
          {{ form.body }}
        </ElCard>
        <ExcelContent v-else :row="form" :is-new="true" :preview="true" />
      </div>
      <div v-else-if="treeSelected">
        <WordContent ref="wordRef" v-if="props.schemaType === 'WORD'" :row="form" :is-new="false" />
        <ExcelContent ref="excelRef" v-else :row="form" :is-new="false" />
      </div>
    </ElCol>
  </ElRow>

  <!-- form -->
  <ElDialog v-model="visible" :title="$t('page.sections')" align-center :show-close="false" width="480">
    <WordContent ref="wordFormRef" v-if="props.schemaType === 'WORD'" :row="form" :is-new="true" />
    <ExcelContent ref="excelFormRef" v-else :row="form" :is-new="true" />
    <template #footer>
      <ElButton title="cancel" @click="visible = false">
        <Icon icon="material-symbols:close" width="1.25em" height="1.25em" />{{ $t('action.cancel') }}
      </ElButton>
      <ElButton title="submit" type="primary" :loading="saveLoading" @click="onSubmit(form.type)">
        <Icon icon="material-symbols:check-circle-outline-rounded" width="1.25em" height="1.25em" /> {{
          $t('action.submit') }}
      </ElButton>
    </template>
  </ElDialog>
</template>