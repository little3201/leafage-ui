<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { UploadRequestOptions } from 'element-plus'
import { dayjs, ElMessage, ElMessageBox } from 'element-plus'
import { disableFile, downloadFile, enableFile, removeFile, retrieveFiles, uploadFile } from 'src/api/file-records'
import { actionTypes, globalIcons } from 'src/constants'
import type { FileRecord, Filter, Pagination } from 'src/types'
import { actionIcon, download, formatFileSize, hasAction, loadIcon } from 'src/utils'
import { onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'


const { t } = useI18n()

const loading = ref<boolean>(false)
const uploadLoading = ref<boolean>(false)
const datas = ref<Array<FileRecord>>([])
const total = ref<number>(0)
const expandRows = ref<Array<FileRecord>>([])
const currentRowId = ref<number | null>(null)

const pagination = reactive<Pagination>({
  page: 1,
  size: 10
})

const filter = reactive<Filter<FileRecord>>({
  superiorId: { op: 'eq', value: currentRowId.value },
  name: { op: 'like', value: undefined }
})

const initialValues: FileRecord = {
  id: null,
  superiorId: null,
  name: '',
  size: 0,
  path: '',
  directory: false,
}
const data = ref<FileRecord>({ ...initialValues })
const visible = ref<boolean>(false)

onMounted(async () => {
  await load()
})

/**
 * 分页变化
 * @param value 当前页码
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
    const res = await retrieveFiles(pagination, filter)
    datas.value = res.data.content
    total.value = res.data.page.totalElements
  } catch (error) {
    datas.value = []
    total.value = 0

    throw error
  } finally {
    loading.value = false
  }
}

/**
 * 详情
 * @param id 主键
 */
function showRow(row: FileRecord) {
  data.value = row ? { ...row } : { ...initialValues }

  visible.value = true
}

/**
 * 启用
 * @param id 主键
 */
async function enableRow(id: number) {
  try {
    await enableFile(id)
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
      await disableFile(id)
      await load()
      ElMessage.success(t('message.success', { action: t('action.disable') }))
    } catch (error) {
      ElMessage.error(t('message.error', { action: t('action.disable') }))
      throw error
    }
  })
}

/**
 * 下载
 * @param id 主键
 */
async function downloadRow(id: number, name: string, type: string) {
  try {
    const res = await downloadFile(id)
    download(res.data, name, type)
  } catch (error) {
    ElMessage.error(t('message.error', { action: t('action.download') }))
    throw error
  }
}

/**
 * 提交
 */
function onUpload(options: UploadRequestOptions) {
  return uploadFile(options.file, currentRowId.value)
}

/**
 * 删除
 * @param id 主键
 * @param name 文件名称
 */
async function removeRow(id: number, name: string) {
  // 弹出确认框
  await ElMessageBox.confirm(
    t('tips.removeWarning', { module: t('page.files'), data: name }),
    t('tips.confirm'),
    {
      dangerouslyUseHTMLString: true,
      showCancelButton: false,
      confirmButtonType: 'danger',
      confirmButtonClass: 'w-full',
      confirmButtonText: t('tips.removeButtonText'),
      type: 'warning'
    }
  ).then(async () => {
    try {
      await removeFile(id)
      await load()

      ElMessage.success(t('message.success', { action: t('action.remove') }))
    } catch (error) {
      ElMessage.error(t('message.error', { action: t('action.remove') }))
      throw error
    }
  })
}

async function onRowClick(row: FileRecord) {
  if (!row.id) return

  if (row.directory) {
    currentRowId.value = row.id
    if (row) {
      expandRows.value.push(row)
    }
    // 设置 filter的superiorId为当前row的id
    if (filter.superiorId) {
      filter.superiorId.value = row.id
    }
    await load()
  } else {
    showRow(row)
  }
}

async function handleBreadcrumbClick(index: number) {
  if (index === -1) {
    // 点击"全部文件夹"，回到根目录
    expandRows.value = []
    currentRowId.value = null
  } else {
    // 截断面包屑数组，保留点击位置及之前的部分
    expandRows.value = expandRows.value.slice(0, index + 1)
    currentRowId.value = expandRows.value[index]?.id || null
  }
  if (filter.superiorId) {
    filter.superiorId.value = currentRowId.value
  }
  await load()
}

function onUploadError() {
  ElMessage.error(t('message.error', { action: t('action.upload') }))
}
</script>

<template>
  <ElRow :gutter="16">
    <ElCol :span="6" :xl="4">
      <ElCard>
        <p class="mt-0"><strong>Space Usage</strong></p>
        <div class="text-center my-6">
          <ElProgress type="dashboard" :percentage="46" :stroke-width="16" :width="200">
            <template #default>
              <span class="block text-sm">Free Space</span>
              <span class="block mt-2">23G/50G</span>
            </template>
          </ElProgress>
        </div>
        <ul class="flex-col space-y-4 list-none px-0">
          <li index="images" class="flex items-center space-x-2">
            <ElButton title="images" circle type="success" size="large">
              <Icon :icon="loadIcon(globalIcons['image'])" width="1.5em" height="1.5em" />
            </ElButton>
            <div class="inline-flex flex-1 flex-col">
              <span>Images</span>
              <span class="text-xs text-(--el-text-color-secondary)">234 files</span>
            </div>
            <span class="text-(--el-text-color-regular)">14GB</span>
          </li>
          <li index="media" class="flex items-center space-x-2">
            <ElButton title="media" circle type="primary" size="large">
              <Icon :icon="loadIcon(globalIcons['video'])" width="1.5em" height="1.5em" />
            </ElButton>
            <div class="inline-flex flex-1 flex-col">
              <span>Media</span>
              <span class="text-xs text-(--el-text-color-secondary)">234 files</span>
            </div>
            <span class="text-(--el-text-color-regular)">5GB</span>
          </li>
          <li index="documents" class="flex items-center space-x-2">
            <ElButton title="documents" circle type="warning" size="large">
              <Icon :icon="loadIcon(globalIcons['doc'])" width="1.5em" height="1.5em" />
            </ElButton>
            <div class="inline-flex flex-1 flex-col">
              <span>Documents</span>
              <span class="text-xs text-(--el-text-color-secondary)">234 files</span>
            </div>
            <span class="text-(--el-text-color-regular)">4GB</span>
          </li>
        </ul>
      </ElCard>
    </ElCol>

    <ElCol :span="18" :xl="20">
      <ElCard>
        <ElRow>
          <ElCol :span="23" class="text-left">
            <ElBreadcrumb class="cursor-pointer font-bold">
              <ElBreadcrumbItem @click="handleBreadcrumbClick(-1)">
                {{ $t('label.all') }}
              </ElBreadcrumbItem>
              <ElBreadcrumbItem v-for="(row, index) in expandRows" :key="index" @click="handleBreadcrumbClick(index)">
                {{ data.name }}
              </ElBreadcrumbItem>
            </ElBreadcrumb>
          </ElCol>
        </ElRow>

        <ElRow :gutter="20" class="mt-4">
          <ElCol :span="12">
            <ElInput v-model="filter.name!.value" clearable style="width: 240px" class="mr-4"
              :placeholder="$t('placeholder.search')">
              <template #prefix>
                <Icon :icon="actionIcon('search')" width="1.25em" height="1.25em" />
              </template>
            </ElInput>
            <ElButton title="search" plain :type="actionTypes['search']" @click="load()">
              <Icon :icon="actionIcon('search')" width="1.25em" height="1.25em" />{{
                $t('action.search') }}
            </ElButton>
          </ElCol>

          <ElCol :span="12" class="inline-flex! justify-end space-x-3">
            <ElUpload multiple :auto-upload="false" :http-request="onUpload" :on-success="() => load()"
              :on-error="onUploadError">
              <ElButton v-if="hasAction($route.name, 'upload')" v-loading="uploadLoading" title="upload" type="primary">
                <Icon :icon="actionIcon('upload')" width="1.25em" height="1.25em" />{{ $t('action.upload') }}
              </ElButton>
            </ElUpload>
          </ElCol>
        </ElRow>

        <ElTable ref="tableRef" v-loading="loading" :data="datas" row-key="id" table-layout="auto">
          <ElTableColumn type="index" :label="$t('label.no')" width="55" />
          <ElTableColumn show-overflow-tooltip prop="name" :label="$t('label.name')" sortable>
            <template #default="scope">
              <ElButton title="name" type="primary" link @click="onRowClick(scope.row)">
                <Icon v-if="scope.row.directory" :icon="loadIcon(globalIcons['folder'])" width="2em" height="2em" />
                <template v-else-if="scope.row.contentType">
                  <Icon v-if="scope.row.contentType.includes('image')" :icon="loadIcon(globalIcons['image'])"
                    width="2em" height="2em" />
                  <Icon v-else :icon="loadIcon(globalIcons['doc'])" width="2em" height="2em" />
                </template>
                <span class="ml-2">{{ scope.row.name }}</span>
              </ElButton>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="size" :label="$t('label.size')" sortable>
            <template #default="scope">
              {{ formatFileSize(scope.row.size) }}
            </template>
          </ElTableColumn>
          <ElTableColumn show-overflow-tooltip prop="contentType" :label="$t('label.contentType')" />
          <ElTableColumn prop="enabled" :label="$t('label.enabled')" sortable>
            <template #default="scope">
              <ElBadge is-dot :type="scope.row.enabled ? 'success' : 'info'" class="mr-1" />
              <ElText :type="scope.row.enabled ? 'success' : 'info'">{{ scope.row.enabled ? 'Y' : 'N' }}</ElText>
            </template>
          </ElTableColumn>
          <ElTableColumn show-overflow-tooltip prop="lastModifiedDate" :label="$t('label.lastModifiedDate')" sortable>
            <template #default="scope">
              {{ scope.row.lastModifiedDate ? dayjs(scope.row.lastModifiedDate).format('YYYY-MM-DD HH:mm') : '-' }}
            </template>
          </ElTableColumn>
          <ElTableColumn :label="$t('label.actions')">
            <template #default="scope">
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
              <ElButton v-if="scope.row.enabled && hasAction($route.name, 'download')" title="download" type="success"
                link @click="downloadRow(scope.row.id, scope.row.name, scope.row.type)">
                <Icon :icon="actionIcon('download')" width="1.25em" height="1.25em" />{{ $t('action.download') }}
              </ElButton>
              <ElButton v-if="hasAction($route.name, 'remove')" title="remove" :type="actionTypes['remove']" link
                @click="removeRow(scope.row.id, scope.row.name)">
                <Icon :icon="actionIcon('remove')" width="1.25em" height="1.25em" />
                {{
                  $t('action.remove')
                }}
              </ElButton>
            </template>
          </ElTableColumn>
        </ElTable>
        <ElPagination layout="->, total, prev, pager, next, sizes" @change="pageChange" :total="total" />
      </ElCard>
    </ElCol>
  </ElRow>

  <!-- details -->
  <ElDialog v-model="visible" :title="$t('action.details')" width="400">
    <div class="text-center">
      <ElImage v-if="data.contentType && data.contentType.includes('image')" :src="data.path"
        class="w-full h-52 overflow-hidden" />
      <Icon v-else :icon="loadIcon(globalIcons['doc'])" width="80" height="80" />
    </div>
    <ElDescriptions :column="1" class="mt-4">
      <ElDescriptionsItem :label="$t('label.name')">{{ data.name }}</ElDescriptionsItem>
      <ElDescriptionsItem :label="$t('label.size')">{{ formatFileSize(data.size) }}</ElDescriptionsItem>
      <ElDescriptionsItem :label="$t('label.contentType')">{{ data.contentType }}</ElDescriptionsItem>
      <ElDescriptionsItem :label="$t('label.lastModifiedDate')">
        {{ data.lastModifiedDate ? dayjs(data.lastModifiedDate).format('YYYY-MM-DD HH:mm') : '-' }}
      </ElDescriptionsItem>
    </ElDescriptions>
  </ElDialog>
</template>
