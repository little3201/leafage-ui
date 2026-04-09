<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type {
  TreeData, TreeInstance, TreeNodeData
} from 'element-plus'
import {
  fetchSchemaSection,
  retrieveSchemaSectionTree
} from 'src/api/schemas'
import { actionIcons } from 'src/constants'
import type { Section } from 'src/types'
import { onMounted, ref, watch } from 'vue'


const props = defineProps<{
  schemaId: number
}>()
const treeRef = ref<TreeInstance>()
const treeData = ref<TreeData>([])
const treeLoading = ref<boolean>(false)
const treeSelected = ref<string>('')
const filterText = ref('')

const initialValues: Section = {
  id: null,
  title: '',
  superiorId: null,
  body: ''
}
const row = ref<Section>({ ...initialValues })

onMounted(async () => {
  await loadTree()
})

/**
 * 监听tree
 */
watch(
  [() => filterText.value, () => props.schemaId],
  async ([newFilterText, newSchemaId], [oldFilterText, oldSchemaId]) => {
    if (newFilterText !== oldFilterText) {
      treeRef.value!.filter(newFilterText)
    }

    if (newSchemaId !== oldSchemaId) {
      await loadTree()
    }
  },
  { immediate: false }
)

/**
 * tree过滤
 */
const filterNode = (value: string, data: { [key: string]: string }) => {
  if (!value) return true
  return data.name?.includes(value) ?? false
}

/**
 * 加载tree
 */
async function loadTree() {
  treeLoading.value = true
  try {
    const res = await retrieveSchemaSectionTree(props.schemaId)
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
    const res = await fetchSchemaSection(props.schemaId, id)
    row.value = res.data
  } catch (error) {
    return error
  }
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
  await loadOne(Number(treeSelected.value))
}
</script>

<template>
  <ElRow :gutter="16">
    <ElCol :span="8" :xl="6">
      <ElCard shadow="never">
        <ElFormItem prop="filterText">
          <ElInput v-model="filterText" :placeholder="$t('action.search')" clearable>
            <template #prefix>
              <Icon :icon="`material-symbols:${actionIcons['search']}-rounded`" width="1.25em" height="1.25em" />
            </template>
          </ElInput>
        </ElFormItem>

        <ElTree ref="treeRef" :data="treeData" v-loading="treeLoading" node-key="id" :current-node-key="treeSelected"
          highlight-current :props="{ label: 'title' }" :filter-node-method="filterNode"
          @current-change="onCurrentChange">
        </ElTree>
      </ElCard>
    </ElCol>

    <ElCol :span="16" :xl="18">
      <ElCard shadow="never">
        {{ row.body }}
      </ElCard>
    </ElCol>
  </ElRow>
</template>