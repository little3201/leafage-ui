<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { UploadInstance, UploadRequestOptions } from 'element-plus'
import { dayjs } from 'element-plus'
import { downloadFile, fetchFile, retrieveFiles, uploadFile } from 'src/api/file-records'
import type { FileRecord, Pagination } from 'src/types'
import { download, formatFileSize, hasAction } from 'src/utils'
import { onMounted, reactive, ref } from 'vue'


const loading = ref<boolean>(false)
const uploadLoading = ref<boolean>(false)
const datas = ref<Array<FileRecord>>([])
const total = ref<number>(0)
const expandRows = ref<Array<FileRecord>>([])
const currentRow = ref<FileRecord>()

const pagination = reactive<Pagination>({
  page: 1,
  size: 10
})

const initialValues: FileRecord = {
  id: null,
  superiorId: null,
  name: '',
  size: 0,
  path: ''
}
const row = ref<FileRecord>({ ...initialValues })
const visible = ref<boolean>(false)
const showTable = ref(true)
const uploadVisible = ref<boolean>(false)
const uploadRef = ref<UploadInstance>()

const filters = ref({
  superiorId: null as string | null,
  name: null
})

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
  filters.value.superiorId = currentRow.value ? `eq:${currentRow.value.id}` : null
  try {
    const res = await retrieveFiles(pagination, filters.value)
    datas.value = res.data.content
    total.value = res.data.page.totalElements
  } catch (error) {
    return error
  } finally {
    loading.value = false
  }
}

async function loadOne(id: number) {
  try {
    const res = await fetchFile(id)
    row.value = res.data
  } catch (error) {
    return error
  }
}

/**
 * reset
 */
async function reset() {
  filters.value.name = null
  await load()
}

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
  try {
    const res = await downloadFile(id)
    download(res.data, name, type)
  } catch (error) {
    return error
  }
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
  return uploadFile(options.file, currentRow.value ? currentRow.value.id : null)
}

/**
 * 删除
 * @param id 主键
 */
function removeRow(id: number) {
  datas.value = datas.value.filter(item => item.id !== id)
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

async function onRowClick(row: FileRecord) {
  if (row?.directory) {
    currentRow.value = row
    if (row) {
      expandRows.value.push(row)
    }
    await load()
  } else if (row?.regularFile) {
    await showRow(row.id)
  }
}

async function handleBreadcrumbClick(index: number) {
  if (index === -1) {
    // 点击"全部文件夹"，回到根目录
    expandRows.value = []
    currentRow.value = undefined
  } else {
    // 点击中间层级的面包屑
    // 截断面包屑数组，保留点击位置及之前的部分
    expandRows.value = expandRows.value.slice(0, index + 1)
    currentRow.value = expandRows.value[index]
  }
  await load()
}
</script>

<template>
  <ElSpace size="large" alignment="flex-start">
    <ElSpace size="large" direction="vertical" fill>
      <ElCard shadow="never">
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
          <li index="images" class="flex items-center space-x-4">
            <ElButton title="images" circle type="success" size="large">
              <Icon icon="material-symbols:image-outline-rounded" width="20" height="20" />
            </ElButton>
            <div class="inline-flex flex-1 flex-col">
              <span>Images</span>
              <span class="text-xs text-(--el-text-color-secondary)">234 files</span>
            </div>
            <span class="text-(--el-text-color-regular)">14GB</span>
          </li>
          <li index="media" class="flex items-center space-x-4">
            <ElButton title="media" circle type="primary" size="large">
              <Icon icon="material-symbols:videocam-outline-rounded" width="20" height="20" />
            </ElButton>
            <div class="inline-flex flex-1 flex-col">
              <span>Media</span>
              <span class="text-xs text-(--el-text-color-secondary)">234 files</span>
            </div>
            <span class="text-(--el-text-color-regular)">5GB</span>
          </li>
          <li index="documents" class="flex items-center space-x-4">
            <ElButton title="documents" circle type="warning" size="large">
              <Icon icon="material-symbols:docs-outline-rounded" width="20" height="20" />
            </ElButton>
            <div class="inline-flex flex-1 flex-col">
              <span>Documents</span>
              <span class="text-xs text-(--el-text-color-secondary)">234 files</span>
            </div>
            <span class="text-(--el-text-color-regular)">4GB</span>
          </li>
        </ul>
      </ElCard>

      <ElCard shadow="never">
        <p class="mt-0"><strong>Recent Files</strong></p>
        <ul class="flex-col list-none px-0">
          <li v-for="i in 5" :key="i" index="images"
            class="flex items-center space-x-2 py-2 rounded-md group hover:bg-neutral-100">
            <Icon icon="material-symbols:image-outline-rounded" width="20" height="20" />
            <span class="flex-1">fullName{{ i }}.jpg</span>
            <Icon icon="material-symbols:close-small-outline-rounded" width="20" height="20"
              class="hidden group-hover:block" />
          </li>
        </ul>
      </ElCard>
    </ElSpace>

    <ElSpace size="large" fill>
      <ElCard shadow="never">
        <ElForm inline :model="filters">
          <ElFormItem :label="$t('label.name')" prop="name">
            <ElInput v-model="filters.name" :placeholder="$t('placeholder.inputText', { field: $t('label.name') })" />
          </ElFormItem>
          <ElFormItem>
            <ElButton title="search" type="primary" @click="load">
              <Icon icon="material-symbols:search-rounded" width="1.25em" height="1.25em" />{{ $t('action.search') }}
            </ElButton>
            <ElButton title="reset" @click="reset">
              <Icon icon="material-symbols:replay-rounded" width="1.25em" height="1.25em" />{{ $t('action.reset') }}
            </ElButton>
          </ElFormItem>
        </ElForm>
      </ElCard>

      <ElCard shadow="never">
        <ElRow :gutter="20" justify="space-between" class="items-center">
          <ElCol :span="16" class="text-left">
            <ElBreadcrumb class="cursor-pointer font-bold">
              <ElBreadcrumbItem @click="handleBreadcrumbClick(-1)">
                全部文件夹
              </ElBreadcrumbItem>
              <ElBreadcrumbItem v-for="(row, index) in expandRows" :key="row.id!" @click="handleBreadcrumbClick(index)">
                {{ row.name }}
              </ElBreadcrumbItem>
            </ElBreadcrumb>
          </ElCol>

          <ElCol :span="8" class="text-right">
            <ElTooltip :content="$t('action.upload')" placement="top">
              <ElButton v-if="hasAction($route.name, 'upload')" title="upload" plain circle type="primary"
                @click="uploadRow">
                <Icon icon="material-symbols:upload" width="1.25em" height="1.25em" />
              </ElButton>
            </ElTooltip>
            <ElTooltip :content="$t('action.refresh')" placement="top">
              <ElButton title="refresh" plain circle @click="load">
                <Icon icon="material-symbols:refresh-rounded" width="1.25em" height="1.25em" />
              </ElButton>
            </ElTooltip>
            <ElTooltip :content="$t('action.view')" placement="top">
              <ElButton title="refresh" type="success" plain circle @click="showTable = !showTable">
                <Icon :icon="`material-symbols:${showTable ? 'grid-view-outline-rounded' : 'view-list-outline'}`"
                  width="1.25em" height="1.25em" />
              </ElButton>
            </ElTooltip>
          </ElCol>
        </ElRow>

        <div v-show="showTable">
          <ElTable ref="tableRef" v-loading="loading" :data="datas" row-key="id" table-layout="auto">
            <ElTableColumn type="index" :label="$t('label.no')" width="55" />
            <ElTableColumn prop="name" :label="$t('label.name')" sortable>
              <template #default="scope">
                <ElButton title="name" type="primary" link @click="onRowClick(scope.row)">
                  <Icon v-if="scope.row.directory" icon="material-symbols:folder-open-outline-rounded" width="2em"
                    height="2em" />
                  <template v-else-if="scope.row.regularFile && scope.row.contentType">
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
            <ElTableColumn prop="contentType" :label="$t('label.contentType')" sortable />
            <ElTableColumn prop="lastModifiedDate" :label="$t('label.lastModifiedDate')" sortable>
              <template #default="scope">
                {{ scope.row.lastModifiedDate ? dayjs(scope.row.lastModifiedDate).format('YYYY-MM-DD HH:mm') : '-' }}
              </template>
            </ElTableColumn>
            <ElTableColumn :label="$t('label.actions')">
              <template #default="scope">
                <ElButton v-if="scope.row.regularFile && hasAction($route.name, 'download')" title="download"
                  type="success" link @click="downloadRow(scope.row.id, scope.row.name, scope.row.type)">
                  <Icon icon="material-symbols:download" width="16" height="16" />{{ $t('action.download') }}
                </ElButton>
                <ElPopconfirm :title="$t('message.removeConfirm')" :width="240" @confirm="confirmEvent(scope.row.id)">
                  <template #reference>
                    <ElButton v-if="hasAction($route.name, 'remove')" title="remove" type="danger" link>
                      <Icon icon="material-symbols:delete-outline-rounded" width="16" height="16" />{{
                        $t('action.remove')
                      }}
                    </ElButton>
                  </template>
                </ElPopconfirm>
              </template>
            </ElTableColumn>
          </ElTable>
          <ElPagination layout="->, total, prev, pager, next, sizes" @change="pageChange" :total="total" />
        </div>

        <div v-show="!showTable"
          class="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 2xl:grid-cols-10">
          <div v-for="(data, index) in datas" :key="index" class="text-center cursor-pointer" @click="onRowClick(data)">
            <Icon v-if="data.directory" icon="material-symbols:folder-open-outline-rounded" width="64" height="64" />
            <template v-else-if="data.regularFile && data.contentType">
              <Icon v-if="data.contentType.includes('image')" icon="material-symbols:image-outline-rounded" width="64"
                height="64" />
              <Icon v-else icon="material-symbols:docs-outline-rounded" width="64" height="64" />
            </template>
            <div>
              <p class="my-1 text-sm text-(--el-text-color-regular)">
                {{ data.name }}
              </p>
            </div>
          </div>
        </div>
      </ElCard>
    </ElSpace>
  </ElSpace>

  <!-- details -->
  <ElDialog v-model="visible" :title="$t('action.details')" align-center width="400">
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
  <ElDialog v-model="uploadVisible" :title="$t('action.upload')" align-center width="480">
    <ElUpload ref="uploadRef" multiple drag :auto-upload="false" :http-request="onUpload" :on-success="load">
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
