<template>
  <q-page padding>

    <q-dialog v-model="visible" persistent>
      <q-card style="min-width: 25em">
        <q-form @submit="onSubmit">
          <q-card-section>
            <div class="text-h6">{{ $t('page.regions') }}</div>
          </q-card-section>

          <q-card-section>
            <q-input outlined dense v-model="form.name" :label="$t('label.name')" lazy-rules
              :rules="[val => val && val.length > 0 || $t('placeholder.inputText')]" />

            <q-input outlined dense v-model="form.description" :label="$t('label.description')" type="textarea" />
          </q-card-section>

          <q-card-actions align="right">
            <q-btn title="cancel" type="reset" unelevated :label="$t('action.cancel')" v-close-popup />
            <q-btn title="submit" type="submit" flat :label="$t('action.submit')" color="primary" />
          </q-card-actions>

        </q-form>
      </q-card>
    </q-dialog>

    <q-table ref="tableRef" flat :title="$t('page.regions')" selection="multiple" v-model:selected="selected"
      :rows="rows" :columns="columns" row-key="id" v-model:pagination="pagination" :loading="loading" :filter="filter"
      binary-state-sort @request="onRequest" class="full-width">
      <template v-slot:top-right>
        <q-input dense debounce="300" v-model="filter" placeholder="Search">
          <template v-slot:append>
            <q-icon name="sym_r_search" />
          </template>
        </q-input>
        <q-btn title="create" round padding="xs" color="primary" class="q-ml-sm" :disable="loading" icon="sym_r_add"
          @click="saveRow()" />
        <q-btn title="refresh" round padding="xs" flat color="primary" class="q-mx-sm" :disable="loading"
          icon="sym_r_refresh" @click="refresh" />
        <q-btn title="import" round padding="xs" flat color="primary" class="q-mx-sm" :disable="loading"
          icon="sym_r_database_upload" @click="importRow" />
        <q-btn title="export" round padding="xs" flat color="primary" icon="sym_r_file_export"
          @click="exportTable(columns, rows)" />
      </template>

      <template v-slot:header="props">
        <q-tr :props="props">
          <q-th auto-width />
          <q-th v-for="col in props.cols" :key="col.name" :props="props">
            {{ $t(`label.${col.label}`) }}
          </q-th>
        </q-tr>
      </template>

      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td auto-width>
            <q-btn title="expand" round flat dense @click="props.expand = !props.expand"
              :icon="props.expand ? 'sym_r_keyboard_arrow_down' : 'sym_r_keyboard_arrow_right'" />
          </q-td>
          <q-td v-for="col in props.cols" :key="col.name">
            <div v-if="col.name === 'id'" class="text-right">
              <q-btn title="modify" padding="xs" flat round color="primary" icon="sym_r_edit"
                @click="saveRow(props.row.id)" />
              <q-btn title="delete" padding="xs" flat round color="negative" icon="sym_r_delete"
                @click="removeRow(props.row.id)" class="q-mt-none q-ml-sm" />
            </div>
            <div v-else-if="col.name === 'enabled'" class="text-center">
              <q-toggle v-model="props.row.enabled" @update:model-value="enableRow(props.row.id)" size="sm"
                color="positive" />
            </div>
            <span v-else>{{ col.value }}</span>
          </q-td>
        </q-tr>
        <q-tr v-show="props.expand" :props="props">
          <q-td colspan="100%" class="q-pr-none">
            <sub-page v-if="props.expand" :title="props.row.name" :superior-id="props.row.id" />
          </q-td>
        </q-tr>
      </template>
    </q-table>

    <!-- import -->
    <q-dialog v-model="importVisible" persistent>
      <q-card>
        <q-card-section class="flex items-center q-pb-none">
          <div class="text-h6">{{ $t('action.import') }}</div>
          <q-space />
          <q-btn icon="sym_r_close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-uploader flat bordered :headers="[{ name: 'Authorization', value: `Bearer ${userStore.accessToken}` }]"
            :factory="onUpload"
            accept=".csv,.xls,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel" />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import type { QTable, QTableColumn, QTableProps } from 'quasar'
import { createRegion, enableRegion, fetchRegion, importRegions, modifyRegion, removeRegion, retrieveRegions } from 'src/api/regions'
import type { Region } from 'src/types'
import { exportTable } from 'src/utils'
import { useUserStore } from 'stores/user-store'
import { onMounted, ref } from 'vue'
import SubPage from './SubPage.vue'


const userStore = useUserStore()

const visible = ref<boolean>(false)
const importVisible = ref<boolean>(false)

const tableRef = ref<QTable>()
const rows = ref<Array<Region>>([])
const filter = ref('')
const loading = ref<boolean>(false)

const initialValues: Region = {
  id: null,
  name: '',
  superiorId: null,
  description: ''
}
const form = ref<Region>({ ...initialValues })

const pagination = ref({
  sortBy: 'id',
  descending: false,
  page: 1,
  rowsPerPage: 7,
  rowsNumber: 0
})

const selected = ref([])

const columns: QTableColumn<Region>[] = [
  { name: 'name', label: 'name', align: 'left', field: 'name', sortable: true },
  { name: 'postalCode', label: 'postalCode', align: 'left', field: 'postalCode', sortable: true },
  { name: 'areaCode', label: 'areaCode', align: 'left', field: 'areaCode', sortable: true },
  { name: 'enabled', label: 'enabled', align: 'center', field: 'enabled' },
  { name: 'description', label: 'description', align: 'left', field: 'description' },
  { name: 'id', label: 'actions', field: 'id' }
]

onMounted(() => {
  refresh()
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
    const res = await retrieveRegions({ ...params }, filter)
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

function importRow() {
  importVisible.value = true
}

function refresh() {
  tableRef.value?.requestServerInteraction()
}

async function enableRow(id: number) {
  try {
    await enableRegion(id)
    refresh()
  } catch (error) {
    return error
  }
}

async function saveRow(id?: number) {
  form.value = { ...initialValues }
  // You can populate the form with existing user data based on the id
  try {
    if (id) {
      const res = await fetchRegion(id)
      form.value = res.data
    }
  } catch (error) {
    return error
  }
  visible.value = true
}

async function removeRow(id: number) {
  loading.value = true
  try {
    await removeRegion(id)
    refresh()
  } catch (error) {
    return error
  } finally {
    loading.value = false
  }
}

async function onSubmit() {
  try {
    if (form.value.id) {
      await modifyRegion(form.value.id, form.value)
    } else {
      await createRegion(form.value)
    }
    visible.value = false
  } catch (error) {
    return error
  }
}

async function onUpload(files: readonly File[]) {
  if (!files || files.length === 0 || !files[0]) {
    throw new Error('No file provided')
  }
  try {
    const res = await importRegions(files[0])
    importVisible.value = false
    refresh()
    return res.data
  } catch (error) {
    return error
  }
}
</script>
