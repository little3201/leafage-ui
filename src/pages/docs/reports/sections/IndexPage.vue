<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type {
  TreeData, TreeInstance,
  TreeNodeData
} from 'element-plus'
import {
  fetchSection,
  retrieveSectionSubset
} from 'src/api/sections'
import type { Section } from 'src/types'
import { onMounted, ref, watch } from 'vue'


const props = defineProps<{
  reportId: number
  preview?: boolean
}>()
const treeRef = ref<TreeInstance>()
const treeLoading = ref<boolean>(false)
const treeSelected = ref<string>('')
const filterText = ref('')

const initialValues: Section = {
  id: null,
  title: '',
  superiorId: null,
  body: ''
}
const form = ref<Section>({ ...initialValues })

onMounted(async () => {
  await loadOne(props.reportId)
})

/**
 * 监听tree
 */
watch(
  () => filterText.value,
  (val) => {
    treeRef.value!.filter(val)
  }
)

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
async function loadTree({ data }: { data: TreeNodeData }, resolve: (data: TreeData) => void) {
  treeLoading.value = true
  try {
    const superiorId = data.id ? Number(data.id) : null
    const res = await retrieveSectionSubset(superiorId)
    const treeData = res.data.map((element: Section) => ({
      ...element,
      isLeaf: !(element.count && element.count > 0)
    }))
    resolve(treeData)
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
 * 表单提交
 */
// async function onSubmit(formEl: FormInstance) {
//   if (!formEl) return
//   const valid = await formEl.validate()
//   if (valid) {
//     try {
//       if (form.value.id) {
//         await modifySection(form.value.id, form.value)
//       }
//     } catch (error) {
//       return error
//     }
//   }
// }
</script>

<template>
  <ElRow :gutter="20">
    <ElCol :span="8" :xl="6">
      <ElCard shadow="never">
        <ElFormItem prop="filterText">
          <ElInput v-model="filterText" :placeholder="$t('action.search')" clearable>
            <template #prefix>
              <Icon icon="material-symbols:search-rounded" width="1.25em" height="1.25em" />
            </template>
          </ElInput>
        </ElFormItem>

        <ElTree ref="treeRef" :load="loadTree" lazy v-loading="treeLoading" node-key="id"
          :current-node-key="treeSelected" highlight-current :props="{ label: 'title', isLeaf: 'isLeaf' }"
          :filter-node-method="filterNode" @current-change="onCurrentChange">
        </ElTree>
      </ElCard>
    </ElCol>

    <ElCol :span="16" :xl="18">
      <ElFormItem prop="body">
        <ElInput v-model="form.body" type="textarea" :rows="20" :disabled="props.preview"
          :placeholder="$t('placeholder.inputText', { field: $t('label.body') })" />
      </ElFormItem>
    </ElCol>
  </ElRow>
</template>