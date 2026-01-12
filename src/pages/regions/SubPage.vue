<template>
  <q-dialog v-model="visible" persistent>
    <q-card style="min-width: 25em">
      <q-form @submit="onSubmit">
        <q-card-section>
          <div class="text-h6">{{ $t('page.regions') }}</div>
        </q-card-section>

        <q-card-section>
          <q-input outlined dense v-model="form.name" label="Region name" lazy-rules
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

  <q-table flat ref="subtableRef" :title="title" selection="multiple" v-model:selected="selected" :rows="rows"
    :columns="columns" row-key="id" :loading="loading" :filter="filter" binary-state-sort @request="onRequest"
    class="full-width" table-class="bg-transparent" v-model:pagination="pagination" hide-pagination>
    <template v-slot:top-right>
      <q-input dense debounce="300" v-model="filter" placeholder="Search">
        <template v-slot:append>
          <q-icon name="sym_r_search" />
        </template>
      </q-input>
      <q-btn title="create" round padding="xs" color="primary" class="q-mx-md" :disable="loading" icon="sym_r_add"
        @click="saveRow()" />
      <q-btn title="refresh" round padding="xs" flat color="primary" class="q-mx-sm" :disable="loading"
        icon="sym_r_refresh" @click="refresh" />
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
</template>

<script setup lang="ts">
import type { QTable, QTableColumn } from 'quasar'
import { createRegion, enableRegion, fetchRegion, modifyRegion, removeRegion, retrieveRegionSubset } from 'src/api/regions'
import type { Region } from 'src/types'
import { exportTable } from 'src/utils'
import { onMounted, ref } from 'vue'


const props = withDefaults(defineProps<{
  title: string
  superiorId: number | null
}>(), {
  title: ''
})

const visible = ref<boolean>(false)

const subtableRef = ref<QTable>()
const rows = ref<Array<Region>>([])
const filter = ref('')
const loading = ref<boolean>(false)

const initialValues: Region = {
  id: null,
  superiorId: props.superiorId,
  name: '',
  description: ''
}
const form = ref<Region>({ ...initialValues })

const pagination = ref({
  rowsPerPage: 0
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
async function onRequest() {
  loading.value = true

  if (props.superiorId) {
    try {
      const res = await retrieveRegionSubset(props.superiorId)
      rows.value = res.data
    } catch {
      return Promise.resolve()
    } finally {
      loading.value = false
    }
  }
}

function refresh() {
  subtableRef.value?.requestServerInteraction()
}

async function enableRow(id: number) {
  try {
    await enableRegion(id)
    refresh()
  } catch {
    return Promise.resolve()
  }
}

async function saveRow(id?: number) {
  form.value = { ...initialValues }
  if (id) {
    try {
      const res = await fetchRegion(id)
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
    await removeRegion(id)
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
      await modifyRegion(form.value.id, form.value)
    } else {
      await createRegion(form.value)
    }
    refresh()
  } catch {
    return Promise.resolve()
  }
  visible.value = false
}
</script>
