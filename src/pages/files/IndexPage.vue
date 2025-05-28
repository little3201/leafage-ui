<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import type { UploadInstance, CheckboxValueType, UploadRequestOptions } from 'element-plus'
import draggable from 'vuedraggable'
import DialogView from 'components/DialogView.vue'
import { dayjs } from 'element-plus'
import { retrieveFiles, fetchFile, uploadFile, downloadFile } from 'src/api/files'
import type { Pagination, FileRecord } from 'src/types'
import { Icon } from '@iconify/vue'
import { formatFileSize, download, hasAction } from 'src/utils'


const loading = ref<boolean>(false)
const uploadLoading = ref<boolean>(false)

const datas = ref<Array<FileRecord>>([])
const total = ref<number>(0)

const pagination = reactive<Pagination>({
  page: 1,
  size: 10
})

const initialValues: FileRecord = {
  id: undefined,
  name: '',
  mimeType: '',
  size: 0
}
const row = ref<FileRecord>({ ...initialValues })
const visible = ref<boolean>(false)
const uploadVisible = ref<boolean>(false)

const checkAll = ref<boolean>(true)
const isIndeterminate = ref<boolean>(false)
const checkedColumns = ref<Array<string>>(['name', 'type', 'size'])
const columns = ref<Array<string>>(['name', 'type', 'size'])

const uploadRef = ref<UploadInstance>()

const filters = ref({
  name: null
})

/**
 * 分页变化
 * @param value 当前页码
 */
function pageChange(currentPage: number, pageSize: number) {
  pagination.page = currentPage
  pagination.size = pageSize
  load()
}

// 排序变化处理
function handleSortChange(data: { prop: string, order: string }) {
  pagination.sortBy = data.prop
  pagination.descending = data.order === 'descending'
  load()
}

/**
 * 加载列表
 */
async function load() {
  loading.value = true
  retrieveFiles(pagination, filters.value).then(res => {
    datas.value = res.data.content
    total.value = res.data.page.totalElements
  }).finally(() => { loading.value = false })
}

async function loadOne(id: number) {
  fetchFile(id).then(res => {
    row.value = res.data
  })
}

/**
 * reset
 */
function reset() {
  filters.value = {
    name: null
  }
  load()
}

onMounted(() => {
  load()
})

function showRow(id: number) {
  loadOne(id)
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
function downloadRow(id: number, name: string, mimeType: string) {
  downloadFile(id).then(res => {
    download(res.data, name, mimeType)
  })
}

/**
 * 提交
 */
function onSubmit(uploadEl: UploadInstance | undefined) {
  if (!uploadEl) return
  uploadLoading.value = true

  uploadRef.value!.submit()

  uploadLoading.value = false
  uploadVisible.value = false
}

function onUpload(options: UploadRequestOptions) {
  return uploadFile(options.file)
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
  <ElSpace size="large" alignment="flex-start">
    <ElSpace class="w-64" size="large" direction="vertical" fill>
      <ElCard shadow="never">
        <p class="mt-0"><strong>Space Usage</strong></p>
        <div class="text-center mt-6">
          <ElProgress type="circle" :percentage="46" :stroke-width="12" :width="180">
            <template #default>
              <span class="block text-sm">Free Space</span>
              <span class="block mt-2">23G/50G</span>
            </template>
          </ElProgress>
        </div>
      </ElCard>

      <ElCard shadow="never">
        <p class="mt-0"><strong>Categories</strong></p>
        <ElMenu class="mt-4">
          <ElMenuItem>
            <ElButton title="images" circle type="success" size="large" class="mr-4">
              <Icon icon="material-symbols:imagesmode-outline-rounded" width="20" height="20" />
            </ElButton>Images
          </ElMenuItem>
          <ElMenuItem>
            <ElButton title="videos" circle type="primary" size="large" class="mr-4">
              <Icon icon="material-symbols:videocam-outline-rounded" width="20" height="20" />
            </ElButton>
            Videos
          </ElMenuItem>
          <ElMenuItem>
            <ElButton title="documents" circle type="warning" size="large" class="mr-4">
              <Icon icon="material-symbols:docs-outline-rounded" width="20" height="20" />
            </ElButton>Documents
          </ElMenuItem>
        </ElMenu>
      </ElCard>
    </ElSpace>

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
            <ElButton v-if="hasAction($route.name, 'upload')" title="upload" type="primary" plain @click="uploadRow">
              <Icon icon="material-symbols:upload" />{{ $t('upload') }}
            </ElButton>
          </ElCol>

          <ElCol :span="8" class="text-right">
            <ElTooltip effect="dark" :content="$t('refresh')" placement="top">
              <ElButton title="refresh" type="primary" plain circle @click="load">
                <Icon icon="material-symbols:refresh-rounded" width="18" height="18" />
              </ElButton>
            </ElTooltip>

            <ElTooltip :content="$t('column') + $t('settings')" placement="top">
              <div class="inline-flex items-center align-middle ml-3">
                <ElPopover :width="200" trigger="click">
                  <template #reference>
                    <ElButton title="settings" type="success" plain circle>
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

        <ElTable v-loading="loading" :data="datas" row-key="id" stripe table-layout="auto"
          @sort-change="handleSortChange">
          <ElTableColumn type="index" :label="$t('no')" width="55" />
          <ElTableColumn prop="name" :label="$t('name')" sortable>
            <template #default="scope">
              <ElButton title="details" type="primary" link @click="showRow(scope.row.id)">
                {{ scope.row.name }}
              </ElButton>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="size" :label="$t('size')" sortable>
            <template #default="scope">
              {{ formatFileSize(scope.row.size) }}
            </template>
          </ElTableColumn>
          <ElTableColumn prop="lastModifiedDate" :label="$t('lastModifiedDate')" sortable>
            <template #default="scope">
              {{ dayjs(scope.row.lastModifiedDate).format('YYYY-MM-DD HH:mm') }}
            </template>
          </ElTableColumn>
          <ElTableColumn :label="$t('actions')">
            <template #default="scope">
              <ElButton v-if="hasAction($route.name, 'download')" title="download" size="small" type="success" link
                @click="downloadRow(scope.row.id, scope.row.name, scope.row.mimeType)">
                <Icon icon="material-symbols:download" width="16" height="16" />{{ $t('download') }}
              </ElButton>
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
  </ElSpace>


  <DialogView v-model="visible" :title="$t('details')" show-close width="35%">

  </DialogView>

  <DialogView v-model="uploadVisible" :title="$t('upload')" width="35%">
    <ElUpload ref="uploadRef" multiple drag :auto-upload="false" :http-request="onUpload" :on-success="load">
      <div class="el-icon--upload inline-flex justify-center">
        <Icon icon="material-symbols:upload-rounded" width="48" height="48" />
      </div>
      <div class="el-upload__text">
        {{ $t('drop2Here') }}<em>{{ $t('click2Upload') }}</em>
      </div>
      <template #tip>
        <div class="el-upload__tip">
          {{ $t('fileSizeLimit', { size: '50MB' }) }}
        </div>
      </template>
    </ElUpload>
    <template #footer>
      <ElButton title="cancel" @click="uploadVisible = false">
        <Icon icon="material-symbols:close" width="18" height="18" />{{ $t('cancel') }}
      </ElButton>
      <ElButton title="submit" type="primary" :loading="uploadLoading" @click="onSubmit(uploadRef)">
        <Icon icon="material-symbols:check-circle-outline-rounded" width="18" height="18" /> {{ $t('submit') }}
      </ElButton>
    </template>
  </DialogView>
</template>
