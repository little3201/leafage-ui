<template>
  <q-page padding>

    <q-dialog v-model="visible" persistent>
      <q-card style="min-width: 25em;">
        <q-form @submit="onSubmit">
          <q-card-section>
            <div class="text-h6">{{ $t('page.regions') }}</div>
          </q-card-section>

          <q-card-section>
            <q-input outlined dense v-model="form.name" :label="$t('label.name')" lazy-rules
              :rules="[val => val && val.length > 0 || $t('placeholder.inputText')]" />

            <q-input outlined dense v-model="form.postalCode" :label="$t('label.postalCode')" lazy-rules
              :rules="[val => val && val.length > 0 || $t('placeholder.inputText')]" />

            <q-input outlined dense v-model="form.areaCode" :label="$t('label.areaCode')" lazy-rules
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

    <div class="row q-gutter-md">
      <div class="col-3">
        <q-card flat>
          <q-card-section>
            <q-tree :nodes="treeDatas" node-key="id" label-key="name" v-model:selected="treeSelected"
              @update:selected="refresh()" @lazy-load="onLazyLoad" />
          </q-card-section>
        </q-card>
      </div>
      <div class="col">
        <q-table ref="tableRef" flat :title="$t('page.regions')" selection="multiple" v-model:selected="selected"
          :rows="rows" :columns="columns" row-key="id" v-model:pagination="pagination" :loading="loading"
          :filter="filter" binary-state-sort @request="onRequest" class="full-width">
          <template v-slot:top-right>
            <q-input dense debounce="300" v-model="filter.name!.value" placeholder="Search">
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
              <q-th v-for="col in props.cols" :key="col.name" :props="props">
                {{ $t(`label.${col.label}`) }}
              </q-th>
            </q-tr>
          </template>

          <template v-slot:body="props">
            <q-tr :props="props">

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

          </template>
        </q-table>
      </div>
    </div>

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
import {
  createRegion, enableRegion, fetchRegion, importRegions, modifyRegion,
  removeRegion, retrieveRegions, retrieveRegionSubset
} from 'src/api/regions'
import type { Filter, Pagination, Region, TreeNode } from 'src/types'
import { exportTable } from 'src/utils'
import { useUserStore } from 'stores/user-store'
import { onMounted, reactive, ref } from 'vue'


const userStore = useUserStore()

const visible = ref<boolean>(false)
const importVisible = ref<boolean>(false)

const treeSelected = ref('')
const treeDatas = ref<Array<TreeNode>>([])

const tableRef = ref<QTable>()
const rows = ref<Array<Region>>([])
const filter = reactive<Filter<Region>>({
  superiorId: { op: 'eq', value: null },
  name: { op: 'like', value: undefined }
})
const loading = ref<boolean>(false)


const initialValues: Region = {
  id: null,
  name: '',
  superiorId: null,
  description: ''
}
const form = ref<Region>({ ...initialValues })

const pagination = ref({
  sortBy: '',
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

onMounted(async () => {
  refresh()

  const res = await retrieveRegions({ page: 1, size: 34, sortBy: 'id', descending: false }, filter)
  treeDatas.value = res.data.content.map((item: Region) => ({
    id: item.id!,
    name: item.name,
    lazy: (item.count ?? 0) > 0
  }))
})

/**
 * 查询列表
 */
async function onRequest(props: Parameters<NonNullable<QTableProps['onRequest']>>[0]) {
  loading.value = true

  const { page, rowsPerPage, sortBy, descending } = props.pagination

  const params: Pagination = { page, size: rowsPerPage }
  if (sortBy) {
    params.sortBy = sortBy
    params.descending = descending
  }

  filter.superiorId!.value = treeSelected.value ? Number(treeSelected.value) : null
  try {
    const res = await retrieveRegions(params, filter)
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

/**
 * lazy load children nodes
 * @param node current node
 * @param key node key, which is the id of region in this case
 */
async function onLazyLoad({ node, key, done }: { node: TreeNode, key: string, done: (children?: readonly TreeNode[]) => void }) {
  if (!key) {
    done([])
    return
  }

  if (node.id) {
    const res = await retrieveRegionSubset(node.id)
    done(res.data.map((item: Region) => ({
      id: item.id!,
      name: item.name,
      lazy: (item.count ?? 0) > 0
    })))
    refresh()
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
      // create region, set superiorId to null if treeSelected is empty
      form.value.superiorId = treeSelected.value ? Number(treeSelected.value) : null
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
