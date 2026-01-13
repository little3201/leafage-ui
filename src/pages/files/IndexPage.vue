<template>
  <q-page padding>

    <q-dialog v-model="visible" persistent>
      <q-card style="min-width: 25em">
        <q-form @submit="onSubmit">
          <q-card-section class="flex items-center q-pb-none">
            <div class="text-h6">{{ $t('page.files') }}</div>
            <q-space />
            <q-btn icon="sym_r_close" flat round dense v-close-popup class="q-pr-none" />
          </q-card-section>

          <q-card-section>
            <div class="row flex-center q-gutter-md">
              <q-img v-if="row.contentType && row.contentType.includes('image')" :src="row.path" />
              <q-icon v-else name="sym_r_docs" size="80px" />
            </div>

            <div class="q-gutter-md q-mt-md">
              <p><strong>{{ $t('label.name') }}</strong>
                {{ row.name }}
              </p>
              <p><strong>{{ $t('label.size') }}</strong>
                {{ formatFileSize(row.size) }}
              </p>
              <p><strong>{{ $t('label.contentType') }}</strong>
                {{ row.contentType }}
              </p>
              <p><strong>{{ $t('label.lastModifiedDate') }}</strong>
                {{ row.lastModifiedDate ? date.formatDate(row.lastModifiedDate, 'YYYY-MM-DD HH:mm') : '-' }}
              </p>
            </div>
          </q-card-section>
        </q-form>
      </q-card>
    </q-dialog>

    <q-dialog v-model="uploadVisible" persistent>
      <q-card style="min-width: 25em">
        <q-form @submit="onSubmit">
          <q-card-section>
            <div class="text-h6">{{ $t('page.files') }}</div>
          </q-card-section>

          <q-card-section>
            <q-uploader flat bordered :headers="[{ name: 'Authorization', value: `Bearer ${userStore.accessToken}` }]"
              :factory="onUpload" />
          </q-card-section>

          <q-card-actions align="right">
            <q-btn title="cancel" type="reset" unelevated :label="$t('action.cancel')" v-close-popup />
            <q-btn title="submit" type="submit" flat :label="$t('action.submit')" color="primary" />
          </q-card-actions>

        </q-form>
      </q-card>
    </q-dialog>

    <div class="row q-col-gutter-md">
      <div style="width: 256px;">
        <q-card flat>
          <q-card-section>
            <p><strong>Space Usage</strong></p>
            <q-circular-progress show-value rounded :thickness="0.15" class="text-light-blue q-ma-md" :value="81"
              size="180px" font-size="16px" color="light-blue" track-color="grey-3">
              <p class="q-px-md q-mb-sm">Free Space</p>
              <p class="text-h5">23G/50G</p>
            </q-circular-progress>
          </q-card-section>
        </q-card>

        <q-card flat class="q-mt-md">
          <q-card-section>
            <p><strong>Categories</strong></p>
            <q-list>
              <q-item clickable v-ripple>
                <q-item-section avatar top>
                  <q-avatar icon="sym_r_imagesmode" color="positive" text-color="white" />
                </q-item-section>
                <q-item-section>Images</q-item-section>
              </q-item>

              <q-item clickable v-ripple>
                <q-item-section avatar top>
                  <q-avatar icon="sym_r_videocam" color="primary" text-color="white" />
                </q-item-section>
                <q-item-section>Videos</q-item-section>
              </q-item>

              <q-item clickable v-ripple>
                <q-item-section avatar top>
                  <q-avatar icon="sym_r_docs" color="warning" text-color="white" />
                </q-item-section>
                <q-item-section>Document</q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <div class="col">
        <q-table ref="tableRef" flat :title="$t('page.files')" :rows="rows" :columns="columns" row-key="id"
          v-model:pagination="pagination" :loading="loading" :filter="filter" binary-state-sort @request="onRequest"
          class="full-width" @row-click="onRowClick">
          <template v-slot:top-left>
            <q-breadcrumbs class="cursor-pointer">
              <template v-slot:separator>
                <q-icon size="1.5em" name="sym_r_chevron_right" color="primary" />
              </template>
              <q-breadcrumbs-el label="全部文件夹" @click="handleBreadcrumbClick(-1)" />
              <q-breadcrumbs-el v-for="(row, index) in expandRows" :key="index" :label="row.name"
                @click="handleBreadcrumbClick(index)" />
            </q-breadcrumbs>
          </template>
          <template v-slot:top-right>
            <q-input dense debounce="300" v-model="filter.name" placeholder="Search">
              <template v-slot:append>
                <q-icon name="sym_r_search" />
              </template>
            </q-input>
            <q-btn title="refresh" round padding="xs" flat color="primary" class="q-mx-sm" :disable="loading"
              icon="sym_r_refresh" @click="refresh" />
            <q-btn title="upload" round padding="xs" color="primary" :disable="loading" icon="sym_r_upload"
              @click="uploadRow" />
          </template>

          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th v-for="col in props.cols" :key="col.name" :props="props">
                {{ $t(`label.${col.label}`) }}
              </q-th>
            </q-tr>
          </template>

          <template v-slot:body-cell-name="props">
            <q-td :props="props">
              <q-btn :title="props.row.name" flat rounded no-caps color="primary">
                <q-icon v-if="props.row.directory" name="sym_r_folder_open" />
                <template v-else-if="props.row.regularFile">
                  <q-icon v-if="props.row.contentType && props.row.contentType.includes('image')" name="sym_r_image" />
                  <q-icon v-else name="sym_r_docs" />
                </template>
                <span class="q-ml-xs">{{ props.row.name }}</span>
              </q-btn>
            </q-td>
          </template>
          <template v-slot:body-cell-size="props">
            <q-td :props="props">
              {{ formatFileSize(props.row.size) }}
            </q-td>
          </template>
          <template v-slot:body-cell-lastModifiedDate="props">
            <q-td :props="props">
              {{ props.row.lastModifiedDate ? date.formatDate(props.row.lastModifiedDate, 'YYYY-MM-DD HH:mm') : '-' }}
            </q-td>
          </template>
          <template v-slot:body-cell-id="props">
            <q-td :props="props">
              <q-btn title="download" padding="xs" flat round color="primary" icon="sym_r_download"
                @click="downloadRow(props.row.id)" />
              <q-btn title="delete" padding="xs" flat round color="negative" icon="sym_r_delete"
                @click="removeRow(props.row.id)" class="q-ml-sm" />
            </q-td>
          </template>
        </q-table>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import type { QTable, QTableColumn, QTableProps } from 'quasar'
import { date } from 'quasar'
import { download, fetchFile, removeFile, retrieveFiles, uploadFile } from 'src/api/files'
import type { FileRecord } from 'src/types'
import { formatFileSize } from 'src/utils'
import { useUserStore } from 'stores/user-store'
import { onMounted, ref } from 'vue'


const userStore = useUserStore()
const visible = ref<boolean>(false)
const uploadVisible = ref<boolean>(false)

const tableRef = ref<QTable>()
const rows = ref<Array<FileRecord>>([])
const filter = ref({
  superiorId: null as string | null,
  name: null
})
const loading = ref<boolean>(false)

const initialValues: FileRecord = {
  id: null,
  name: '',
  size: 0,
  path: ''
}
const row = ref<FileRecord>({ ...initialValues })

const pagination = ref({
  sortBy: 'id',
  descending: true,
  page: 1,
  rowsPerPage: 7,
  rowsNumber: 0
})

const expandRows = ref<Array<FileRecord>>([])
const currentRow = ref<FileRecord | null>(null)

const columns: QTableColumn<FileRecord>[] = [
  { name: 'name', label: 'name', align: 'left', field: 'name', sortable: true },
  { name: 'contentType', label: 'contentType', align: 'left', field: 'contentType', sortable: true },
  { name: 'size', label: 'size', align: 'left', field: 'size', sortable: true },
  { name: 'lastModifiedDate', label: 'lastModifiedDate', align: 'left', field: 'lastModifiedDate', sortable: true },
  { name: 'id', label: 'actions', field: 'id' }
]

onMounted(() => {
  tableRef.value?.requestServerInteraction()
})

/**
 * 查询列表
 */
async function onRequest(props: Parameters<NonNullable<QTableProps['onRequest']>>[0]) {
  loading.value = true

  const { page, rowsPerPage, sortBy, descending } = props.pagination

  props.filter.superiorId = currentRow.value ? `eq:${currentRow.value.id}` : null
  const filter = props.filter
  const params = { page, size: rowsPerPage, sortBy, descending }

  try {
    const res = await retrieveFiles({ ...params }, filter)
    pagination.value.page = page
    pagination.value.rowsPerPage = rowsPerPage
    pagination.value.sortBy = sortBy
    pagination.value.descending = descending

    rows.value = res.data.content
    pagination.value.rowsNumber = res.data.totalElements
  } catch (error) {
    return error
  } finally {
    loading.value = false
  }
}

function refresh() {
  tableRef.value?.requestServerInteraction()
}

async function showRow(id: number | undefined) {
  if (id) {
    try {
      const res = await fetchFile(id)
      row.value = res.data
    } catch (error) {
      return error
    }
  }
  visible.value = true
}

function uploadRow() {
  uploadVisible.value = true
}

async function onUpload(files: readonly File[]) {
  if (!files || files.length === 0 || !files[0]) {
    throw new Error('No file provided')
  }
  const res = await uploadFile(files[0])

  uploadVisible.value = false
  refresh()
  return res.data
}

async function downloadRow(id: number) {
  try {
    await download(id)
  } catch (error) {
    return error
  }
}

async function removeRow(id: number) {
  try {
    await removeFile(id)
    refresh()
  } catch (error) {
    return error
  }
}

function onSubmit() {
  // Close the dialog after submitting
  uploadVisible.value = false
}

function onRowClick(evt: Event, row: FileRecord) {
  if (row?.directory) {
    currentRow.value = row
    if (row) {
      expandRows.value.push(row)
    }
    refresh()
  } else if (row?.regularFile) {
    void showRow(row.id!)
  }
}

function handleBreadcrumbClick(index: number) {
  if (index === -1) {
    // 点击"全部文件夹"，回到根目录
    expandRows.value = []
    currentRow.value = null
  } else {
    // 点击中间层级的面包屑
    // 截断面包屑数组，保留点击位置及之前的部分
    expandRows.value = expandRows.value.slice(0, index + 1)
    currentRow.value = expandRows.value[index] ?? null
  }
  refresh()
}
</script>
