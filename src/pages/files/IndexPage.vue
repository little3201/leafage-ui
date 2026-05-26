<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { UploadInstance, UploadRequestOptions } from 'element-plus'
import { dayjs, ElMessage, ElMessageBox } from 'element-plus'
import { downloadFile, fetchFile, removeFile, retrieveFiles, uploadFile } from 'src/api/file-records'
import { actionIcons, actionTypes } from 'src/constants'
import type { FileRecord, Filter, Pagination } from 'src/types'
import { download, formatFileSize, hasAction } from 'src/utils'
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
const row = ref<FileRecord>({ ...initialValues })
const visible = ref<boolean>(false)
const uploadVisible = ref<boolean>(false)
const uploadRef = ref<UploadInstance>()

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
 * 查询
 * @param id 主键
 */
async function loadOne(id: number) {
  try {
    const res = await fetchFile(id)
    row.value = res.data
  } catch (error) {
    row.value = { ...initialValues }
    throw error
  }
}

/**
 * 查看弹出框
 * @param id 主键
 */
async function showRow(id: number | null) {
  if (id) {
    await loadOne(id)
  }
  visible.value = true
}

/**
 * 上传
 */
function uploadRow() {
  uploadVisible.value = true
}

/**
 * 下载
 * @param id 主键
 */
async function downloadRow(id: number, name: string, type: string) {
  const res = await downloadFile(id)
  download(res.data, name, type)
}

/**
 * 提交
 */
function onSubmit(uploadEl: UploadInstance) {
  if (!uploadEl) return
  uploadLoading.value = true

  uploadRef.value!.submit()

  uploadLoading.value = false
  uploadVisible.value = false
}

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
    await showRow(row.id)
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

async function onUploadSuccess() {
  await load()
  ElMessage.success(t('message.success', { action: t('action.upload') }))
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
              <Icon icon="material-symbols:image-outline-rounded" width="1.5em" height="1.5em" />
            </ElButton>
            <div class="inline-flex flex-1 flex-col">
              <span>Images</span>
              <span class="text-xs text-(--el-text-color-secondary)">234 files</span>
            </div>
            <span class="text-(--el-text-color-regular)">14GB</span>
          </li>
          <li index="media" class="flex items-center space-x-2">
            <ElButton title="media" circle type="primary" size="large">
              <Icon icon="material-symbols:videocam-outline-rounded" width="1.5em" height="1.5em" />
            </ElButton>
            <div class="inline-flex flex-1 flex-col">
              <span>Media</span>
              <span class="text-xs text-(--el-text-color-secondary)">234 files</span>
            </div>
            <span class="text-(--el-text-color-regular)">5GB</span>
          </li>
          <li index="documents" class="flex items-center space-x-2">
            <ElButton title="documents" circle type="warning" size="large">
              <Icon icon="material-symbols:docs-outline-rounded" width="1.5em" height="1.5em" />
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
                {{ row.name }}
              </ElBreadcrumbItem>
            </ElBreadcrumb>
          </ElCol>
        </ElRow>

        <ElRow :gutter="20" class="my-4">
          <ElCol :span="12">
            <ElInput v-model="filter.name!.value" clearable style="width: 240px" class="mr-4"
              :placeholder="$t('placeholder.search')">
              <template #prefix>
                <Icon :icon="`material-symbols:${actionIcons['search']}-rounded`" width="1.25em" height="1.25em" />
              </template>
            </ElInput>
            <ElButton title="search" plain :type="actionTypes['search']" @click="load()">
              <Icon :icon="`material-symbols:${actionIcons['search']}-rounded`" width="1.25em" height="1.25em" />{{
                $t('action.search') }}
            </ElButton>
          </ElCol>

          <ElCol :span="12" class="text-right">
            <ElButton v-if="hasAction($route.name, 'upload')" title="upload" type="primary" @click="uploadRow">
              <Icon icon="material-symbols:upload" width="1.25em" height="1.25em" />{{ $t('action.upload') }}
            </ElButton>
          </ElCol>
        </ElRow>

        <ElTable ref="tableRef" v-loading="loading" :data="datas" row-key="id" table-layout="auto">
          <ElTableColumn type="index" :label="$t('label.no')" width="55" />
          <ElTableColumn prop="name" :label="$t('label.name')" sortable>
            <template #default="scope">
              <ElButton title="name" type="primary" link @click="onRowClick(scope.row)">
                <Icon v-if="scope.row.directory" icon="material-symbols:folder-open-outline-rounded" width="2em"
                  height="2em" />
                <template v-else-if="scope.row.contentType">
                  <Icon v-if="scope.row.contentType.includes('image')" icon="material-symbols:image-outline-rounded"
                    width="2em" height="2em" />
                  <Icon v-else icon="material-symbols:docs-outline-rounded" width="2em" height="2em" />
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
          <ElTableColumn show-overflow-tooltip prop="contentType" :label="$t('label.contentType')" sortable />
          <ElTableColumn prop="lastModifiedDate" :label="$t('label.lastModifiedDate')" sortable>
            <template #default="scope">
              {{ scope.row.lastModifiedDate ? dayjs(scope.row.lastModifiedDate).format('YYYY-MM-DD HH:mm') : '-' }}
            </template>
          </ElTableColumn>
          <ElTableColumn :label="$t('label.actions')">
            <template #default="scope">
              <ElButton v-if="hasAction($route.name, 'download')" title="download" type="success" link
                @click="downloadRow(scope.row.id, scope.row.name, scope.row.type)">
                <Icon icon="material-symbols:download" width="1.25em" height="1.25em" />{{ $t('action.download') }}
              </ElButton>
              <ElButton v-if="hasAction($route.name, 'remove')" title="remove" :type="actionTypes['remove']" link
                @click="removeRow(scope.row.id, scope.row.name)">
                <Icon :icon="`material-symbols:${actionIcons['remove']}-rounded`" width="1.25em" height="1.25em" />
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
      <ElImage v-if="row.contentType && row.contentType.includes('image')" :src="row.path"
        class="w-full h-52 overflow-hidden" />
      <Icon v-else icon="material-symbols:docs-outline-rounded" width="80" height="80" />
    </div>
    <ElDescriptions v-loading="loading" :column="1" class="mt-4">
      <ElDescriptionsItem :label="$t('label.name')">{{ row.name }}</ElDescriptionsItem>
      <ElDescriptionsItem :label="$t('label.size')">{{ formatFileSize(row.size) }}</ElDescriptionsItem>
      <ElDescriptionsItem :label="$t('label.contentType')">{{ row.contentType }}</ElDescriptionsItem>
      <ElDescriptionsItem :label="$t('label.lastModifiedDate')">
        {{ row.lastModifiedDate ? dayjs(row.lastModifiedDate).format('YYYY-MM-DD HH:mm') : '-' }}
      </ElDescriptionsItem>
    </ElDescriptions>
  </ElDialog>

  <!-- upload -->
  <ElDialog v-model="uploadVisible" :title="$t('action.upload')" width="480">
    <ElUpload ref="uploadRef" multiple drag :auto-upload="false" :http-request="onUpload" @success="onUploadSuccess"
      @error="onUploadError">
      <div class="el-icon--upload inline-flex justify-center">
        <Icon icon="material-symbols:upload-rounded" width="48" height="48" />
      </div>
      <div class="el-upload__text">
        {{ $t('tips.drop2Here') }}<em>{{ $t('tips.click2Upload') }}</em>
      </div>
      <template #tip>
        <div class="el-upload__tip">
          {{ $t('tips.fileSizeLimit', { size: '50MB' }) }}
        </div>
      </template>
    </ElUpload>
    <template #footer>
      <ElButton title="cancel" @click="uploadVisible = false">
        <Icon icon="material-symbols:close" width="1.25em" height="1.25em" />{{ $t('action.cancel') }}
      </ElButton>
      <ElButton title="submit" type="primary" :loading="uploadLoading" @click="onSubmit(uploadRef!)">
        <Icon icon="material-symbols:check-circle-outline-rounded" width="1.25em" height="1.25em" /> {{
          $t('action.submit') }}
      </ElButton>
    </template>
  </ElDialog>
</template>
