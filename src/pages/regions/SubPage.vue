<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import type { TableInstance, FormInstance, FormRules } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { retrieveRegions, fetchRegion, createRegion, modifyRegion, removeRegion, enableRegion } from 'src/api/regions'
import type { Pagination, Region } from 'src/types'
import { Icon } from '@iconify/vue'
import { hasAction } from 'src/utils'


const { t } = useI18n()

const props = defineProps<{
  superiorId: number,
  title: string
}>()

const loading = ref<boolean>(false)
const datas = ref<Array<Region>>([])
const total = ref<number>(0)

const tableRef = ref<TableInstance>()
const pagination = reactive<Pagination>({
  page: 1,
  size: 10
})

const saveLoading = ref<boolean>(false)
const visible = ref<boolean>(false)

const formRef = ref<FormInstance>()
const initialValues: Region = {
  id: undefined,
  name: '',
  superiorId: props.superiorId
}
const form = ref<Region>({ ...initialValues })

const rules = reactive<FormRules<typeof form>>({
  name: [
    { required: true, message: t('placeholder.inputText', { field: t('label.name') }), trigger: 'blur' }
  ]
})

onMounted(async () => {
  await load()
})

/**
 * 分页变化
 * @param currentPage 当前页码
 * @param pageSize 分页大小
 */
async function pageChange(currentPage: number, pageSize: number) {
  pagination.page = currentPage
  pagination.size = pageSize
  await load()
}

/**
 * 加载列表
 */
async function load() {
  loading.value = true
  try {
    const res = await retrieveRegions(pagination, { superiorId: props.superiorId })
    datas.value = res.data.content
    total.value = res.data.page.totalElements
  } catch {
    return Promise.resolve()
  } finally {
    loading.value = false
  }
}

/**
 * 弹出框
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
    const res = await fetchRegion(id)
    form.value = res.data
  } catch {
    return Promise.resolve()
  }
}

/**
 * 启用、停用
 * @param id 主键
 */
async function enableChange(id: number) {
  try {
    await enableRegion(id)
    await load()
  } catch {
    return Promise.resolve()
  }
}

/**
 * 表单提交
 */
async function onSubmit(formEl: FormInstance | undefined) {
  if (!formEl) return

  await formEl.validate(async (valid) => {
    if (valid) {
      saveLoading.value = true
      try {
        if (form.value.id) {
          await modifyRegion(form.value.id, form.value)
        } else {
          form.value.superiorId = props.superiorId
          await createRegion(form.value)
        }
        visible.value = false
        await load()
      } catch {
        return Promise.resolve()
      } finally {
        saveLoading.value = false
      }
    }
  })
}

/**
 * 删除
 * @param id 主键
 */
async function removeRow(id: number) {
  try {
    await removeRegion(id)
    await load()
  } catch {
    return Promise.resolve()
  }
}

/**
 * 确认
 * @param id 主键
 */
async function confirmEvent(id: number) {
  await removeRow(id)
}
</script>

<template>
  <ElCard shadow="never">
    <ElRow :gutter="20" justify="end" align="middle" class="mb-4">
      <ElCol :span="12" class="text-left">
        <span class="text-xl">{{ title }}</span>
      </ElCol>
      <ElCol :span="12" class="text-right">
        <ElButton v-if="hasAction($route.name, 'create')" type="primary" @click="saveRow()">
          <Icon icon="material-symbols:add-rounded" width="18" height="18" />{{ $t('action.create') }}
        </ElButton>
        <ElTooltip class="box-item" effect="dark" :content="$t('action.refresh')" placement="top">
          <ElButton type="primary" plain circle @click="load">
            <Icon icon="material-symbols:refresh-rounded" width="18" height="18" />
          </ElButton>
        </ElTooltip>
      </ElCol>
    </ElRow>

    <ElTable ref="tableRef" v-loading="loading" :data="datas" row-key="id" table-layout="auto">
      <ElTableColumn type="selection" />
      <ElTableColumn type="expand">
        <template #default="props">
          <SubPage :superior-id="props.row.id" :title="props.row.name" />
        </template>
      </ElTableColumn>
      <ElTableColumn type="index" :label="$t('label.no')" width="55" />
      <ElTableColumn prop="name" :label="$t('label.name')" sortable />
      <ElTableColumn prop="areaCode" :label="$t('label.areaCode')" sortable />
      <ElTableColumn prop="postalCode" :label="$t('label.postalCode')" sortable />
      <ElTableColumn prop="enabled" :label="$t('label.enabled')" sortable>
        <template #default="scope">
          <ElSwitch size="small" v-model="scope.row.enabled" @change="enableChange(scope.row.id)"
            style="--el-switch-on-color: var(--el-color-success);" :disabled="!hasAction($route.name, 'enable')" />
        </template>
      </ElTableColumn>
      <ElTableColumn show-overflow-tooltip prop="description" :label="$t('label.description')" />
      <ElTableColumn :label="$t('label.actions')">
        <template #default="scope">
          <ElButton v-if="hasAction($route.name, 'modify')" type="primary" link @click="saveRow(scope.row.id)">
            <Icon icon="material-symbols:edit-outline-rounded" width="16" height="16" />{{ $t('action.modify') }}
          </ElButton>
          <ElPopconfirm :title="$t('message.removeConfirm')" :width="240" @confirm="confirmEvent(scope.row.id)">
            <template #reference>
              <ElButton v-if="hasAction($route.name, 'remove')" type="danger" link>
                <Icon icon="material-symbols:delete-outline-rounded" width="16" height="16" />{{ $t('action.remove') }}
              </ElButton>
            </template>
          </ElPopconfirm>
        </template>
      </ElTableColumn>
    </ElTable>
    <ElPagination layout="slot, ->, total, prev, pager, next, sizes" @change="pageChange" :total="total">
      <template #default>
        {{ $t('message.selectedTotal', { total: tableRef?.getSelectionRows().length }) }}
      </template>
    </ElPagination>
  </ElCard>

  <!-- form -->
  <ElDialog v-model="visible" :title="$t('page.regions')" align-center append-to-body width="480">
    <ElForm ref="formRef" :model="form" :rules="rules" label-position="top">
      <ElRow :gutter="20">
        <ElCol>
          <ElFormItem :label="$t('label.name')" prop="name">
            <ElInput v-model="form.name" :placeholder="$t('placeholder.inputText', { field: $t('label.name') })" />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow :gutter="20">
        <ElCol>
          <ElFormItem :label="$t('label.areaCode')" prop="areaCode">
            <ElInput v-model="form.areaCode"
              :placeholder="$t('placeholder.inputText', { field: $t('label.areaCode') })" />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow :gutter="20">
        <ElCol>
          <ElFormItem :label="$t('label.postalCode')" prop="postalCode">
            <ElInput v-model="form.postalCode"
              :placeholder="$t('placeholder.inputText', { field: $t('label.postalCode') })" />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow :gutter="20">
        <ElCol>
          <ElFormItem :label="$t('label.description')" prop="description">
            <ElInput v-model="form.description" type="textarea"
              :placeholder="$t('placeholder.inputText', { field: $t('label.description') })" />
          </ElFormItem>
        </ElCol>
      </ElRow>
    </ElForm>
    <template #footer>
      <ElButton @click="visible = false">
        <Icon icon="material-symbols:close" width="18" height="18" />{{ $t('action.cancel') }}
      </ElButton>
      <ElButton type="primary" :loading="saveLoading" @click="onSubmit(formRef)">
        <Icon icon="material-symbols:check-circle-outline-rounded" width="18" height="18" /> {{ $t('action.submit') }}
      </ElButton>
    </template>
  </ElDialog>
</template>

<style lang="scss" scoped>
.el-card {
  border: none !important;
}
</style>
