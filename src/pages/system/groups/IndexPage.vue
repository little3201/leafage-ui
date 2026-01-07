<template>
  <q-page padding>
    <q-dialog v-model="visible" persistent>
      <q-card style="min-width: 25em">
        <q-form @submit="onSubmit">
          <q-card-section>
            <div class="text-h6">{{ $t('page.groups') }}</div>
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

    <q-table ref="tableRef" flat :title="$t('page.groups')" selection="multiple" v-model:selected="selected"
      :rows="rows" :columns="columns" row-key="id" :pagination="pagination" :loading="loading" :filter="filter"
      binary-state-sort @request="onRequest" class="full-width col">
      <template v-slot:top-right>
        <q-input dense debounce="300" v-model="filter" placeholder="Search">
          <template v-slot:append>
            <q-icon name="sym_r_search" />
          </template>
        </q-input>
        <q-btn title="create" round padding="xs" color="primary" class="q-ml-sm" :disable="loading" icon="sym_r_add"
          @click="saveRow()" />
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

      <template v-slot:body-cell-members="props">
        <q-td :props="props">
          <template v-if="props.row.members && props.row.members.length > 0">
            <q-avatar v-for="(item, index) in visibleArray(props.row.members, 5)" :key="index" size="32px"
              :style="{ left: `${index * -2}px`, border: '2px solid white' }">
              <img :src="`${cdn_url}/${item}.jpg`" :alt="`avater_${index}`" />
            </q-avatar>
            <q-chip color="primary" text-color="white" class="q-mr-xs" size="sm" v-if="props.row.members.length > 5">
              + {{ props.row.members.length - 5 }}
              <q-tooltip>
                <q-avatar v-for="(item, index) in props.row.members.slice(5)" :key="index" size="3em"
                  :style="{ left: `${(index as number) * -2}px`, border: '2px solid white' }">
                  <img :src="`${cdn_url}/${item}`" :alt="`avater_${index}`" />
                </q-avatar>
              </q-tooltip>
            </q-chip>
          </template>
        </q-td>
      </template>
      <template v-slot:body-cell-enabled="props">
        <q-td :props="props">
          <q-toggle v-model="props.row.enabled" @update:model-value="enableRow(props.row.id)" size="sm"
            color="positive" />
        </q-td>
      </template>
      <template v-slot:body-cell-id="props">
        <q-td :props="props">
          <q-btn title="modify" padding="xs" flat round color="primary" icon="sym_r_edit"
            @click="saveRow(props.row.id)" />
          <q-btn title="relation" padding="xs" flat round color="positive" icon="sym_r_link"
            @click="relationRow(props.row.id)" class="q-mx-sm" />
          <q-btn title="delete" padding="xs" flat round color="negative" icon="sym_r_delete"
            @click="removeRow(props.row.id)" />
        </q-td>
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
import { ref, onMounted } from 'vue'
import type { QTableProps } from 'quasar'
import { useUserStore } from 'stores/user-store'
import { retrieveGroups, fetchGroup, createGroup, modifyGroup, removeGroup, enableGroup, importGroups } from 'src/api/groups'
import { visibleArray, exportTable } from 'src/utils'
import type { Group } from 'src/types'


const userStore = useUserStore()
const cdn_url = process.env.CDN_URL
const visible = ref<boolean>(false)
const importVisible = ref<boolean>(false)

const tableRef = ref()
const rows = ref<QTableProps['rows']>([])
const filter = ref('')
const loading = ref<boolean>(false)

const initialValues: Group = {
  id: undefined,
  name: '',
  enabled: true
}
const form = ref<Group>({ ...initialValues })

const pagination = ref({
  sortBy: 'id',
  descending: false,
  page: 1,
  rowsPerPage: 7,
  rowsNumber: 0
})

const selected = ref([])

const columns: QTableProps['columns'] = [
  { name: 'name', label: 'name', align: 'left', field: 'name', sortable: true },
  { name: 'members', label: 'members', align: 'center', field: 'members' },
  { name: 'enabled', label: 'enabled', align: 'center', field: 'enabled' },
  { name: 'description', label: 'description', field: 'description' },
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
    const res = await retrieveGroups({ ...params }, filter)
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
  tableRef.value.requestServerInteraction()
}

function relationRow(id: number) {
  // id
  alert(id)
}

async function enableRow(id: number) {
  try {
    await enableGroup(id)
    refresh()
  } catch {
    return Promise.resolve()
  }
}

async function saveRow(id?: number) {
  form.value = { ...initialValues }
  // You can populate the form with existing user data based on the id
  if (id) {
    try {
      const res = await fetchGroup(id)
      form.value = res.data
    } catch {
      return Promise.resolve()
    }
  }
  visible.value = true
}

async function removeRow(id: number) {
  loading.value = true
  try {
    await removeGroup(id)
    refresh()
  } catch {
    return Promise.resolve()
  } finally {
    loading.value = false
  }
}

async function onSubmit() {
  try {
    if (form.value.id) {
      await modifyGroup(form.value.id, form.value)
    } else {
      await createGroup(form.value)
    }
    refresh()
  } catch {
    return Promise.resolve()
  }
  visible.value = false
}

async function onUpload(files: readonly File[]) {
  if (!files || files.length === 0 || !files[0]) {
    return Promise.reject(new Error('No file provided'))
  }
  try {
    const res = await importGroups(files[0])
    importVisible.value = false
    refresh()
    return res.data
  } catch {
    return Promise.resolve()
  }
}
</script>
