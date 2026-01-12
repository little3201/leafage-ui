<template>
  <q-page padding>

    <q-dialog v-model="visible" persistent>
      <q-card style="min-width: 25em">
        <q-form @submit="onSubmit">
          <q-card-section>
            <div class="text-h6">{{ $t('page.privileges') }}</div>
          </q-card-section>

          <q-card-section>
            <div class="row q-col-gutter-x-md">
              <q-input outlined dense v-model="form.name" :label="$t('label.name')" lazy-rules
                :rules="[val => val && val.length > 0 || $t('placeholder.inputText')]" class="col-6" />
              <q-input outlined dense v-model="form.path" :label="$t('label.path')" lazy-rules
                :rules="[val => val && val.length > 0 || $t('placeholder.inputText')]" class="col-6" />
            </div>

            <div class="row q-col-gutter-x-md">
              <q-input outlined dense v-model="form.component" :label="$t('label.component')" lazy-rules
                :rules="[val => val && val.length > 0 || $t('placeholder.inputText')]" class="col-6" />
              <q-select outlined dense v-model="form.redirect" :label="$t('label.redirect')" :options="subset"
                emit-value option-value="id" option-label="name" style="width: 50%;" class="col-6" />
            </div>

            <div v-if="!form.redirect" class="row q-gutter-xs">
              <q-chip v-for="(item, idx) in buttonOptions" :key="idx" :selected="form.actions?.includes(item.name)"
                :color="actions[item.name]">
                {{ $t(item.name) }}
              </q-chip>
            </div>

            <q-input outlined dense v-model="form.description" type="textarea" :label="$t('label.description')" />
          </q-card-section>

          <q-card-actions align="right">
            <q-btn title="cancel" type="reset" unelevated :label="$t('action.cancel')" v-close-popup />
            <q-btn title="submit" type="submit" flat :label="$t('action.submit')" color="primary" />
          </q-card-actions>

        </q-form>
      </q-card>
    </q-dialog>

    <q-table ref="tableRef" flat :title="$t('page.privileges')" :rows="rows" :columns="columns" row-key="id"
      :loading="loading" v-model:pagination="pagination" :filter="filter" binary-state-sort @request="onRequest"
      class="full-width">
      <template v-slot:top-right>
        <q-input dense debounce="300" v-model="filter" placeholder="Search">
          <template v-slot:append>
            <q-icon name="sym_r_search" />
          </template>
        </q-input>
        <q-btn title="refresh" round padding="xs" flat color="primary" class="q-ml-sm" :disable="loading"
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
            <q-btn v-if="props.row.count > 0" title="expand" round flat dense @click="props.expand = !props.expand"
              :icon="props.expand ? 'sym_r_keyboard_arrow_down' : 'sym_r_keyboard_arrow_right'" />
          </q-td>
          <q-td v-for="col in props.cols" :key="col.name">
            <div v-if="col.name === 'id'" class="text-right">
              <q-btn title="modify" padding="xs" flat round color="primary" icon="sym_r_edit"
                @click="saveRow(col.value)" />
            </div>
            <div v-else-if="col.name === 'name'">
              <q-icon :name="`sym_r_${props.row.icon}`" size="sm" class="q-pr-sm" />{{ $t(`page.${col.value}`) }}
            </div>
            <div v-else-if="col.name === 'actions' && props.row.actions && props.row.actions.length > 0">
              <q-chip v-for="(item, index) in visibleArray(props.row.actions, 3)" :key="index"
                :label="$t(`action.${item}`)" :color="actions[item]" text-color="white" class="q-mr-sm" size="sm" />
              <template v-if="props.row.actions.length > 3">
                <q-chip color="primary" text-color="white" class="q-mr-sm" size="sm">
                  + {{ props.row.actions.length - 3 }}
                  <q-tooltip>
                    <q-chip v-for="(item, index) in props.row.actions.slice(3)" :key="index"
                      :label="$t(`action.${item}`)" :color="actions[item]" text-color="white" class="q-mr-sm"
                      size="sm" />
                  </q-tooltip>
                </q-chip>
              </template>
            </div>
            <div v-else-if="col.name === 'enabled'" class="text-center">
              <q-toggle v-model="props.row.enabled" @update:model-value="enableRow(props.row.id)" size="sm"
                color="positive" />
            </div>
            <span v-else>{{ col.value }}</span>
          </q-td>
        </q-tr>
        <q-tr v-show="props.expand" :props="props">
          <q-td colspan="100%">
            <sub-page v-if="props.expand" :title="props.row.name" :superior-id="props.row.id"
              :options="buttonOptions" />
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
import { retrieveDictionarySubset } from 'src/api/dictionaries'
import { enablePrivilege, fetchPrivilege, importPrivileges, modifyPrivilege, retrievePrivileges, retrievePrivilegeSubset } from 'src/api/privileges'
import { actions } from 'src/constants'
import type { Dictionary, Privilege } from 'src/types'
import { exportTable, visibleArray } from 'src/utils'
import { useUserStore } from 'stores/user-store'
import { onMounted, ref } from 'vue'
import SubPage from './SubPage.vue'


const userStore = useUserStore()

const visible = ref<boolean>(false)
const importVisible = ref<boolean>(false)

const tableRef = ref<QTable>()
const rows = ref<Array<Privilege>>([])
const filter = ref('')
const loading = ref<boolean>(false)
const buttonOptions = ref<Array<Dictionary>>([])

const initialValues: Privilege = {
  id: null,
  name: '',
  superiorId: null,
  path: '',
  component: '',
  icon: '',
  actions: [],
  description: ''
}
const form = ref<Privilege>({ ...initialValues })

const pagination = ref({
  sortBy: 'id',
  descending: false,
  page: 1,
  rowsPerPage: 7,
  rowsNumber: 0
})

const columns: QTableColumn<Privilege>[] = [
  { name: 'name', label: 'name', align: 'left', field: 'name', sortable: true },
  { name: 'path', label: 'path', align: 'left', field: 'path', sortable: true },
  { name: 'actions', label: 'actions', align: 'left', field: 'actions' },
  { name: 'enabled', label: 'enabled', align: 'center', field: 'enabled' },
  { name: 'description', label: 'description', align: 'left', field: 'description' },
  { name: 'id', label: 'actions', field: 'id' }
]

const subset = ref<Array<Privilege>>()

onMounted(async () => {
  refresh()

  const res = await retrieveDictionarySubset(100)
  buttonOptions.value = res.data
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
    const res = await retrievePrivileges({ ...params }, filter)
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

function importRow() {
  importVisible.value = true
}

function refresh() {
  tableRef.value?.requestServerInteraction()
}

async function enableRow(id: number) {
  try {
    await enablePrivilege(id)
    refresh()
  } catch {
    return Promise.resolve()
  }
}

async function saveRow(id: number) {
  form.value = { ...initialValues }
  // You can populate the form with existing user data based on the id
  if (id) {
    try {
      const [res, subRes] = await Promise.all([fetchPrivilege(id), retrievePrivilegeSubset(id)])
      form.value = res.data
      subset.value = subRes.data
    } catch {
      return Promise.resolve()
    }
  }
  visible.value = true
}

async function onSubmit() {
  if (form.value.id) {
    try {
      await modifyPrivilege(form.value.id, form.value)
      refresh()
    } catch {
      return Promise.resolve()
    }
  }
  visible.value = false
}

async function onUpload(files: readonly File[]) {
  if (!files || files.length === 0 || !files[0]) {
    return Promise.reject(new Error('No file provided'))
  }
  try {
    const res = await importPrivileges(files[0])
    importVisible.value = false
    refresh()
    return res.data
  } catch {
    return Promise.resolve()
  }
}
</script>
