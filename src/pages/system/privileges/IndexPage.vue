<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { FormInstance, FormRules, InputInstance, TableInstance, UploadRequestOptions } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  disablePrivilege,
  enablePrivilege,
  importPrivileges,
  modifyPrivilege,
  retrievePrivileges, retrievePrivilegeSubset
} from '@/api/system/privileges'
import { actionIcons, actionTypes } from '@/constants'
import type { Dictionary, Filter, Pagination, Privilege } from '@/types'
import { actionIcon, exportToCSV, hasAction, pageIcon, visibleArray } from '@/utils'
import { nextTick, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'


const { t } = useI18n()

const loading = ref<boolean>(false)
const datas = ref<Array<Privilege>>([])
const total = ref<number>(0)

const tableRef = ref<TableInstance>()
const pagination = reactive<Pagination>({
  page: 1,
  size: 10
})

const saveLoading = ref<boolean>(false)
const visible = ref<boolean>(false)

const importLoading = ref<boolean>(false)
const exportLoading = ref<boolean>(false)

const filter = reactive<Filter<Privilege>>({
  name: { op: 'like', value: undefined }
})

const formRef = ref<FormInstance>()
const initialValues: Privilege = {
  id: null,
  name: '',
  superiorId: null,
  path: '',
  component: '',
  actions: []
}
const form = ref<Privilege>({ ...initialValues })
const subset = ref<Array<Privilege>>()

const rules = reactive<FormRules<typeof form>>({
  name: [
    { required: true, trigger: 'blur' }
  ],
  path: [
    { required: true, trigger: 'blur' }
  ]
})
const inputValue = ref('')
const inputVisible = ref(false)
const InputRef = ref<InputInstance>()

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

async function load(row?: Privilege, treeNode?: unknown, resolve?: (date: Privilege[]) => void) {
  loading.value = true

  if (row && row.id && resolve) {
    const res = await retrievePrivilegeSubset(row.id)
    const list = res.data
    // 处理子节点
    list.forEach((element: Privilege) => {
      if (element.count && element.count > 0) {
        element.hasChildren = true
      }
    })
    resolve(list)
  } else {
    const res = await retrievePrivileges(pagination, filter)
    const list = res.data.content
    // 处理子节点
    list.forEach((element: Privilege) => {
      if (element.count && element.count > 0) {
        element.hasChildren = true
      }
    })
    datas.value = list
    total.value = res.data.page.totalElements
  }

  loading.value = false
}

/**
 * 刷新子节点
 * @param rowKey row key
 */
const refreshChildren = async (rowKey: number) => {
  const res = await retrievePrivilegeSubset(rowKey)
  const list = res.data
  // 处理子节点
  list.forEach((element: Dictionary) => {
    if (element.count && element.count > 0) {
      element.hasChildren = true
    }
  })

  tableRef.value?.updateKeyChildren(String(rowKey), list)
}

/**
 * 弹出框
 * @param row 数据
 */
async function saveRow(row?: Privilege) {
  form.value = row ? { ...row } : { ...initialValues }

  if (row && row.id) {
    const res = await retrievePrivilegeSubset(row.id)
    subset.value = res.data
  }
  visible.value = true
}

/**
 * 启用
 * @param id 主键
 */
async function enableRow(id: number) {
  try {
    await enablePrivilege(id)
    await load()
    ElMessage.success(t('message.success', { action: t('action.enable') }))
  } catch (error) {
    ElMessage.error(t('message.error', { action: t('action.enable') }))
    throw error
  }
}

/**
 * 停用
 * @param id 主键
 */
async function disableRow(id: number) {
  await ElMessageBox.confirm(
    t('tips.disableWarning'),
    t('tips.confirm'),
    {
      dangerouslyUseHTMLString: true,
      showCancelButton: false,
      confirmButtonType: 'danger',
      confirmButtonClass: 'w-full',
      confirmButtonText: t('tips.disableButtonText'),
      type: 'warning'
    }
  ).then(async () => {
    try {
      await disablePrivilege(id)
      await load()
      ElMessage.success(t('message.success', { action: t('action.disable') }))
    } catch (error) {
      ElMessage.error(t('message.error', { action: t('action.disable') }))
      throw error
    }
  })
}

/**
 * 表单提交
 */
async function onSubmit(formEl: FormInstance) {
  if (!formEl) return

  const valid = await formEl.validate()
  if (valid) {
    saveLoading.value = true
    if (form.value.id) {
      try {
        await modifyPrivilege(form.value.id, form.value)

        visible.value = false

        ElMessage.success(t('message.success', { action: form.value.id ? t('action.modify') : t('action.create') }))
        await load()

        if (form.value.superiorId) {
          await refreshChildren(form.value.superiorId)
        }
      } catch (error) {
        ElMessage.success(t('message.success', { action: form.value.id ? t('action.modify') : t('action.create') }))
        throw error
      } finally {
        saveLoading.value = false
      }
    }
  }
}

/**
 * 导出
 */
function exportRows() {
  exportLoading.value = true

  const selectedRows = tableRef.value?.getSelectionRows()
  if (selectedRows && selectedRows.length) {
    exportToCSV(selectedRows, 'privileges')
  } else {
    exportToCSV(datas.value, 'privileges')
  }
  exportLoading.value = false
}

/**
 * 导入
 */
function onUpload(options: UploadRequestOptions) {
  return importPrivileges(options.file)
}

function handleClose(tag: string) {
  if (form.value.actions) {
    form.value.actions.splice(form.value.actions.indexOf(tag), 1)
  }
}

function showInput() {
  inputVisible.value = true
  void nextTick(() => {
    InputRef.value!.input!.focus()
  })
}

function handleInputConfirm() {
  if (inputValue.value && form.value.actions) {
    form.value.actions.push(inputValue.value)
  }
  inputVisible.value = false
  inputValue.value = ''
}
</script>

<template>
  <ElCard>
    <ElRow :gutter="20" justify="space-between" class="mb-4">
      <ElCol :span="12">
        <ElInput v-model="filter.name!.value" clearable style="width: 240px" class="mr-4"
          :placeholder="$t('placeholder.search')">
          <template #prefix>
            <Icon :icon="actionIcon('search')" width="1.25em" height="1.25em" />
          </template>
        </ElInput>
        <ElButton title="search" plain :type="actionTypes['search']" @click="load()">
          <Icon :icon="actionIcon('search')" width="1.25em" height="1.25em" />
          {{ $t('action.search') }}
        </ElButton>
      </ElCol>

      <ElCol :span="12" class="inline-flex! justify-end space-x-3">
        <ElUpload :limit="1" :auto-upload="false" :http-request="onUpload" :on-success="() => load()"
          accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel">
          <ElButton v-if="hasAction($route.name, 'import')" v-loading="importLoading" title="import"
            :type="actionTypes['import']" plain>
            <Icon :icon="actionIcon('import')" width="1.25em" height="1.25em" />{{
              $t('action.import') }}
          </ElButton>
        </ElUpload>

        <ElButton v-if="hasAction($route.name, 'export')" title="export" :type="actionTypes['export']" plain
          @click="exportRows" :loading="exportLoading">
          <Icon :icon="actionIcon('export')" width="1.25em" height="1.25em" />{{
            $t('action.export') }}
        </ElButton>
      </ElCol>
    </ElRow>

    <ElTable ref="tableRef" v-loading="loading" :data="datas" lazy :load="load" row-key="id" table-layout="auto">
      <ElTableColumn type="selection" />
      <ElTableColumn type="index" :label="$t('label.no')" width="55" />
      <ElTableColumn prop="name" :label="$t('label.name')">
        <template #default="scope">
          <Icon :icon="pageIcon(scope.row.name)" style="vertical-align: -3.5px" width="1.25em" height="1.25em"
            class="mr-2" />
          {{ scope.row.name ? $t(`page.${scope.row.name}`) : '' }}
        </template>
      </ElTableColumn>
      <ElTableColumn prop="path" :label="$t('label.path')" />
      <ElTableColumn prop="actions" :label="$t('label.actions')">
        <template #default="scope">
          <ElTag v-for="(item, index) in visibleArray(scope.row.actions, 3)" :key="index" :type="actionTypes[item]"
            class="mr-2">
            {{ $t(`action.${item}`) }}
          </ElTag>
          <ElPopover v-if="scope.row.actions && scope.row.actions.length > 3" placement="top-start" trigger="hover">
            <template #reference>
              <ElTag type="primary">
                +{{ scope.row.actions.length - 3 }}
              </ElTag>
            </template>
            <ElTag v-for="(item, index) in scope.row.actions.slice(3)" :key="index" :type="actionTypes[item]"
              class="mb-2 mr-2">
              {{ $t(`action.${item}`) }}
            </ElTag>
          </ElPopover>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="enabled" :label="$t('label.enabled')" sortable>
        <template #default="scope">
          <ElBadge is-dot :type="scope.row.enabled ? 'success' : 'info'" class="mr-1" />
          <ElText :type="scope.row.enabled ? 'success' : 'info'">{{ scope.row.enabled ? 'Y' : 'N' }}</ElText>
        </template>
      </ElTableColumn>
      <ElTableColumn :label="$t('label.actions')">
        <template #default="scope">
          <ElButton v-if="hasAction($route.name, 'modify')" title="modify" :type="actionTypes['modify']" link
            @click="saveRow(scope.row)">
            <Icon :icon="actionIcon('modify')" width="1.25em" height="1.25em" />{{
              $t('action.modify')
            }}
          </ElButton>
          <ElButton v-if="scope.row.enabled && hasAction($route.name, 'disable')" title="disable"
            :type="actionTypes['disable']" link @click="disableRow(scope.row.id)">
            <Icon :icon="actionIcon('disable')" width="1.25em" height="1.25em" />{{
              $t('action.disable') }}
          </ElButton>
          <ElButton v-else-if="hasAction($route.name, 'enable')" title="enable" :type="actionTypes['enable']" link
            @click="enableRow(scope.row.id)">
            <Icon :icon="actionIcon('enable')" width="1.25em" height="1.25em" />{{
              $t('action.enable') }}
          </ElButton>
          <ElButton v-if="scope.row.count > 0" title="refresh" link @click="refreshChildren(scope.row.id)">
            <Icon :icon="actionIcon('refresh')" width="1.25em" height="1.25em" />{{
              $t('action.refresh') }}
          </ElButton>
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
  <ElDialog v-model="visible" :title="form.id ? $t('action.modify') : $t('action.create')" :show-close="false"
    width="480">
    <ElForm ref="formRef" :model="form" :rules="rules" label-position="top">
      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem :label="$t('label.name')" prop="name">
            <ElInput v-model="form.name" :placeholder="$t('placeholder.inputText', { field: $t('label.name') })"
              disabled>
            </ElInput>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem :label="$t('label.path')" prop="path">
            <ElInput v-model="form.path" :placeholder="$t('placeholder.inputText', { field: $t('label.path') })"
              disabled />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem :label="$t('label.component')" prop="component">
            <ElInput v-model="form.component"
              :placeholder="$t('placeholder.inputText', { field: $t('label.component') })" disabled />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem :label="$t('label.redirect')" prop="redirect">
            <ElSelect v-model="form.redirect"
              :placeholder="$t('placeholder.selectText', { field: $t('label.redirect') })">
              <ElOption v-for="item in subset" :key="item.id!" :label="$t(`page.${item.name}`)" :value="item.path" />
            </ElSelect>
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow :gutter="20">
        <ElCol>
          <ElFormItem :label="$t('label.actions')" prop="actions">
            <div class="inline-flex flex-wrap gap-2">
              <ElTag v-for="(item, index) in form.actions" :key="index" closable :type="actionTypes[item]"
                @close="handleClose(item)">
                <Icon :icon="actionIcon(actionIcons[item])" style="vertical-align: -3.5px" width="1.25em"
                  height="1.25em" />
                {{ $t(`action.${item}`) }}
              </ElTag>

              <ElInput v-if="inputVisible" ref="InputRef" v-model="inputValue" class="w-20"
                @keyup.enter="handleInputConfirm" @blur="handleInputConfirm" />
              <ElButton v-else circle size="small" type="primary" plain @click="showInput()">
                <Icon :icon="actionIcon('add')" width="1.25em" height="1.25em" />
              </ElButton>
            </div>
          </ElFormItem>
        </ElCol>
      </ElRow>
    </ElForm>

    <template #footer>
      <ElButton title="cancel" @click="visible = false">
        <Icon :icon="actionIcon('cancel')" width="1.25em" height="1.25em" />{{
          $t('action.cancel') }}
      </ElButton>
      <ElButton title="submit" type="primary" :loading="saveLoading" @click="onSubmit(formRef!)">
        <Icon :icon="actionIcon('submit')" width="1.25em" height="1.25em" /> {{
          $t('action.submit') }}
      </ElButton>
    </template>
  </ElDialog>
</template>
