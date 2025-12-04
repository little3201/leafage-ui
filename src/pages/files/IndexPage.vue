<template>
  <q-page padding>

    <q-dialog v-model="visible" persistent>
      <q-card style="min-width: 25em">
        <q-form @submit="onSubmit">
          <q-card-section>
            <div class="text-h6">{{ $t('files') }}</div>
          </q-card-section>

          <q-card-section>
            <q-uploader flat bordered :headers="[{ name: 'Authorization', value: `Bearer ${userStore.accessToken}` }]"
              :factory="onUpload" />
          </q-card-section>

          <q-card-actions align="right">
            <q-btn title="cancel" type="reset" unelevated :label="$t('cancel')" v-close-popup />
            <q-btn title="submit" type="submit" flat :label="$t('submit')" color="primary" />
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
        <q-table ref="tableRef" flat :title="$t('files')" :rows="rows" :columns="columns" row-key="id"
          v-model:pagination="pagination" :loading="loading" :filter="filter" binary-state-sort @request="onRequest"
          class="full-width">
          <template v-slot:top-right>
            <q-input dense debounce="300" v-model="filter" placeholder="Search">
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
                {{ $t(col.label) }}
              </q-th>
            </q-tr>
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
                @click="downloadRow(props.row.id)" class="q-mt-none" />
              <q-btn title="delete" padding="xs" flat round color="negative" icon="sym_r_delete"
                @click="removeRow(props.row.id)" class="q-mt-none q-ml-sm" />
            </q-td>
          </template>
        </q-table>
      </div>

    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { QTableProps } from 'quasar'
import { date } from 'quasar'
import { useUserStore } from 'stores/user-store'
import { retrieveFiles, uploadFile, download, removeFile } from 'src/api/files'
import { formatFileSize } from 'src/utils'


const userStore = useUserStore()
const visible = ref<boolean>(false)

const tableRef = ref()
const rows = ref<QTableProps['rows']>([])
const filter = ref('')
const loading = ref<boolean>(false)

const pagination = ref({
  sortBy: 'id',
  descending: true,
  page: 1,
  rowsPerPage: 7,
  rowsNumber: 0
})

const columns: QTableProps['columns'] = [
  { name: 'name', label: 'name', align: 'left', field: 'name', sortable: true },
  { name: 'mimeType', label: 'type', align: 'left', field: 'mimeType', sortable: true },
  { name: 'size', label: 'size', align: 'left', field: 'size', sortable: true },
  { name: 'id', label: 'actions', field: 'id' }
]

onMounted(() => {
  tableRef.value.requestServerInteraction()
})

/**
 * 查询列表
 */
async function onRequest(props: Parameters<NonNullable<QTableProps['onRequest']>>[0]) {
  loading.value = true

  const { page, rowsPerPage, sortBy, descending } = props.pagination
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
  } catch {
    return Promise.resolve()
  } finally {
    loading.value = false
  }
}

function refresh() {
  tableRef.value.requestServerInteraction()
}

function uploadRow() {
  visible.value = true
}

async function onUpload(files: readonly File[]) {
  if (!files || files.length === 0 || !files[0]) {
    return Promise.reject(new Error('No file provided'))
  }
  const res = await uploadFile(files[0])

  visible.value = false
  refresh()
  return res.data
}

async function downloadRow(id: number) {
  try {
    await download(id)
  } catch {
    return Promise.resolve()
  }
}

async function removeRow(id: number) {
  try {
    await removeFile(id)
    refresh()
  } catch {
    return Promise.resolve()
  }
}

function onSubmit() {
  // Close the dialog after submitting
  visible.value = false
}

</script>
