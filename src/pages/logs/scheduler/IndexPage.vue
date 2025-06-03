<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { dayjs } from 'element-plus'
import type { TableInstance, CheckboxValueType } from 'element-plus'
import draggable from 'vuedraggable'
import DialogView from 'components/DialogView.vue'
import { retrieveSchedulerLogs, fetchSchedulerLog } from 'src/api/scheduler-logs'
import type { Pagination, SchedulerLog } from 'src/types'
import { Icon } from '@iconify/vue'
import { formatDuration, hasAction, exportToCSV } from 'src/utils'

const loading = ref<boolean>(false)
const datas = ref<Array<SchedulerLog>>([])
const total = ref<number>(0)

const tableRef = ref<TableInstance>()
const pagination = reactive<Pagination>({
  page: 1,
  size: 10
})

const checkAll = ref<boolean>(true)
const isIndeterminate = ref<boolean>(false)
const checkedColumns = ref<Array<string>>(['name', 'startTime', 'status', 'executedTimes', 'nextExecuteTime'])
const columns = ref<Array<string>>(['name', 'startTime', 'status', 'executedTimes', 'nextExecuteTime'])

const filters = ref({
  name: null,
  method: null
})

const detailLoading = ref<boolean>(false)
const exportLoading = ref<boolean>(false)
const initialValues: SchedulerLog = {
  id: undefined,
  name: ''
}
const row = ref<SchedulerLog>({ ...initialValues })

const visible = ref<boolean>(false)
/**
 * 分页变化
 * @param value 当前页码
 */
function pageChange(currentPage: number, pageSize: number) {
  pagination.page = currentPage
  pagination.size = pageSize
  load()
}

/**
 * 加载列表
 */
async function load() {
  retrieveSchedulerLogs(pagination, filters.value).then(res => {
    datas.value = res.data.content
    total.value = res.data.page.totalElements
  }).finally(() => { loading.value = false })
}

/**
 * 加载
 * @param id 主键
 */
async function loadOne(id: number) {
  detailLoading.value = true
  fetchSchedulerLog(id).then(res => {
    row.value = res.data
  }).finally(() => { detailLoading.value = false })
}

/**
 * reset
 */
function reset() {
  filters.value = {
    name: null,
    method: null
  }
  load()
}

onMounted(() => {
  load()
})

/**
 * 导出
 */
async function exportRows() {
  exportLoading.value = true

  const selectedRows = tableRef.value?.getSelectionRows()
  if (selectedRows && selectedRows.length) {
    exportToCSV(selectedRows, 'scheduler-logs')
  }
  exportLoading.value = false
}

/**
 * 详情
 * @param id 主键
 */
function showRow(id: number) {
  row.value = { ...initialValues }
  visible.value = true
  loadOne(id)
}

/**
 * 删除
 * @param id 主键
 */
function removeRow(id: number) {
  datas.value = datas.value.filter(item => item.id !== id)
}

/**
 * 清空
 */
function clearRows() {
}

/**
 * 确认
 * @param id 主键
 */
function confirmEvent(id: number) {
  if (id) {
    removeRow(id)
  }
}

/**
 * 全选操作
 * @param val 是否全选
 */
function handleCheckAllChange(val: CheckboxValueType) {
  checkedColumns.value = val ? columns.value : []
  isIndeterminate.value = false
}

/**
 * 选中操作
 * @param value 选中的值
 */
function handleCheckedChange(value: CheckboxValueType[]) {
  const checkedCount = value.length
  checkAll.value = checkedCount === columns.value.length
  isIndeterminate.value = checkedCount > 0 && checkedCount < columns.value.length
}
</script>

<template>
  <ElSpace size="large" fill>
    <ElCard shadow="never">
      <ElForm inline :model="filters">
        <ElFormItem :label="$t('name')" prop="name">
          <ElInput v-model="filters.name" :placeholder="$t('inputText', { field: $t('name') })" />
        </ElFormItem>
        <ElFormItem>
          <ElButton title="search" type="primary" @click="load">
            <Icon icon="material-symbols:search-rounded" width="18" height="18" />{{ $t('search') }}
          </ElButton>
          <ElButton title="reset" @click="reset">
            <Icon icon="material-symbols:replay-rounded" width="18" height="18" />{{ $t('reset') }}
          </ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>

    <ElCard shadow="never">
      <ElRow :gutter="20" justify="space-between" class="mb-4">
        <ElCol :span="16" class="text-left">
          <ElButton v-if="hasAction($route.name, 'clear')" title="clear" type="danger" plain @click="clearRows">
            <Icon icon="material-symbols:clear-all-rounded" width="18" height="18" />{{ $t('clear') }}
          </ElButton>
          <ElButton v-if="hasAction($route.name, 'export')" title="export" type="success" plain @click="exportRows"
            :loading="exportLoading">
            <Icon icon="material-symbols:file-export-outline-rounded" width="18" height="18" />{{ $t('export') }}
          </ElButton>
        </ElCol>

        <ElCol :span="8" class="text-right">
          <ElTooltip class="box-item" effect="dark" :content="$t('refresh')" placement="top">
            <ElButton title="refresh" type="primary" plain circle @click="load">
              <Icon icon="material-symbols:refresh-rounded" width="18" height="18" />
            </ElButton>
          </ElTooltip>

          <ElTooltip :content="$t('column') + $t('settings')" placement="top">
            <div class="inline-flex items-center align-middle ml-3">
              <ElPopover :width="200" trigger="click">
                <template #reference>
                  <ElButton title="setgings" type="success" plain circle>
                    <Icon icon="material-symbols:format-list-bulleted" width="18" height="18" />
                  </ElButton>
                </template>
                <div>
                  <ElCheckbox v-model="checkAll" :indeterminate="isIndeterminate" @change="handleCheckAllChange">
                    {{ $t('all') }}
                  </ElCheckbox>
                  <ElDivider />
                  <ElCheckboxGroup v-model="checkedColumns" @change="handleCheckedChange">
                    <draggable v-model="columns" item-key="simple">
                      <template #item="{ element }">
                        <div class="flex items-center space-x-2">
                          <Icon icon="material-symbols:drag-indicator" width="18" height="18"
                            class="hover:cursor-move" />
                          <ElCheckbox :label="element" :value="element" :disabled="element === columns[0]">
                            <div class="inline-flex items-center space-x-4">
                              {{ $t(element) }}
                            </div>
                          </ElCheckbox>
                        </div>
                      </template>
                    </draggable>
                  </ElCheckboxGroup>
                </div>
              </ElPopover>
            </div>
          </ElTooltip>
        </ElCol>
      </ElRow>

      <ElTable ref="tableRef" v-loading="loading" :data="datas" row-key="id" stripe table-layout="auto">
        <ElTableColumn type="selection" width="55" />
        <ElTableColumn type="index" :label="$t('no')" width="55" />
        <ElTableColumn prop="name" :label="$t('name')" sortable>
          <template #default="scope">
            <ElButton title="details" type="primary" link @click="showRow(scope.row.id)">
              {{ scope.row.name }}
            </ElButton>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="startTime" :label="$t('startTime')" sortable>
          <template #default="scope">
            {{ dayjs(scope.row.startTime).format('YYYY-MM-DD HH:mm') }}
          </template>
        </ElTableColumn>
        <ElTableColumn prop="status" :label="$t('status')" sortable>
          <template #default="scope">
            <ElTag v-if="scope.row.status === 0" type="primary" round>
              <Icon icon="material-symbols:progress-activity" class="spin mr-1" />{{ $t('processing') }}
            </ElTag>
            <ElTag v-else-if="scope.row.status === 1" type="success" round>
              <Icon icon="material-symbols:check-rounded" class="mr-1" />{{ $t('done') }}
            </ElTag>
            <ElTag v-else type="danger" round>
              <Icon icon="material-symbols:error-outline-rounded" class="mr-1" />{{ $t('failure') }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="executedTimes" :label="$t('executedTimes')" sortable>
          <template #default="scope">
            {{ scope.row.executedTimes ? formatDuration(scope.row.executedTimes) : '-' }}
          </template>
        </ElTableColumn>
        <ElTableColumn prop="nextExecuteTime" :label="$t('nextExecuteTime')" sortable>
          <template #default="scope">
            {{ dayjs(scope.row.nextExecuteTime).format('YYYY-MM-DD HH:mm') }}
          </template>
        </ElTableColumn>
        <ElTableColumn :label="$t('actions')">
          <template #default="scope">
            <ElPopconfirm :title="$t('removeConfirm')" :width="240" @confirm="confirmEvent(scope.row.id)">
              <template #reference>
                <ElButton v-if="hasAction($route.name, 'remove')" title="remove" size="small" type="danger" link>
                  <Icon icon="material-symbols:delete-outline-rounded" width="16" height="16" />{{ $t('remove') }}
                </ElButton>
              </template>
            </ElPopconfirm>
          </template>
        </ElTableColumn>
      </ElTable>
      <ElPagination layout="prev, pager, next, sizes, jumper, ->, total" @change="pageChange" :total="total" />
    </ElCard>
  </ElSpace>

  <DialogView v-model="visible" show-close :title="$t('details')">
    <ElDescriptions v-loading="detailLoading" border>
      <ElDescriptionsItem :label="$t('name')">{{ row.name }}</ElDescriptionsItem>
      <ElDescriptionsItem :label="$t('startTime')">
        {{ dayjs(row.startTime).format('YYYY-MM-DD HH:mm') }}
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="$t('executedTimes')">
        {{ row.executedTimes ? formatDuration(row.executedTimes) : '-' }}
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="$t('status')">
        <ElTag v-if="row.status === 0" type="primary" round>{{ $t('processing') }}</ElTag>
        <ElTag v-else-if="row.status === 1" type="success" round>{{ $t('done') }}</ElTag>
        <ElTag v-else type="danger" round>{{ $t('failure') }}</ElTag>
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="$t('nextExecuteTime')" :span="2">
        {{ dayjs(row.nextExecuteTime).format('YYYY-MM-DD HH:mm') }}
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="$t('logs')" :span="3">
        {{ row.record }}
      </ElDescriptionsItem>
    </ElDescriptions>
  </DialogView>
</template>

<style lang="scss">
.el-tag__content {
  display: inline-flex;
  align-items: center;
}
</style>
