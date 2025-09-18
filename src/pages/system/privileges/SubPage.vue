<template>

  <q-dialog v-model="visible" persistent>
    <q-card style="min-width: 25em">
      <q-form @submit="onSubmit">
        <q-card-section>
          <div class="text-h6">{{ $t('privileges') }}</div>
        </q-card-section>

        <q-card-section>
          <div class="row q-col-gutter-x-md">
            <q-input outlined dense v-model="form.name" :label="$t('name')" lazy-rules
              :rules="[val => val && val.length > 0 || $t('inputText')]" class="col-6" />
            <q-input outlined dense v-model="form.path" :label="$t('path')" lazy-rules
              :rules="[val => val && val.length > 0 || $t('inputText')]" class="col-6" />
          </div>

          <div class="row q-col-gutter-x-md">
            <q-input outlined dense v-model="form.component" :label="$t('component')" lazy-rules
              :rules="[val => val && val.length > 0 || $t('inputText')]" class="col-6" />
            <q-select outlined dense v-model="form.redirect" :label="$t('redirect')" :options="subset" emit-value
              option-value="id" option-label="name" style="width: 50%;" class="col-6" />
          </div>

          <div v-if="!form.redirect" class="row q-gutter-xs">
            <q-chip v-for="(item, idx) in options" :key="idx" :selected="form.actions?.includes(item.name)"
              :color="actions[item.name]">
              {{ $t(item.name) }}
            </q-chip>
          </div>

          <q-input outlined dense v-model="form.description" type="textarea" :label="$t('description')" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn title="cancel" type="reset" unelevated :label="$t('cancel')" v-close-popup />
          <q-btn title="submit" type="submit" flat :label="$t('submit')" color="primary" />
        </q-card-actions>

      </q-form>
    </q-card>
  </q-dialog>

  <q-table flat ref="subTableRef" :title="$t(title)" :rows="rows" :columns="columns" row-key="id" :loading="loading"
    :filter="filter" binary-state-sort @request="onRequest" class="full-width">
    <template v-slot:top-right>
      <q-input dense debounce="300" v-model="filter" placeholder="Search">
        <template v-slot:append>
          <q-icon name="sym_r_search" />
        </template>
      </q-input>

      <q-btn title="refresh" round padding="xs" flat color="primary" class="q-ml-sm" :disable="loading"
        icon="sym_r_refresh" @click="refresh" />
    </template>

    <template v-slot:header="props">
      <q-tr :props="props">
        <q-th auto-width />
        <q-th v-for="col in props.cols" :key="col.name" :props="props">
          {{ $t(col.label) }}
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
            <q-btn title="modify" padding="xs" flat round color="primary" icon="sym_r_edit" @click="saveRow(col.value)"
              class="q-mt-none" />
          </div>
          <div v-else-if="col.name === 'name'">
            <q-icon :name="`sym_r_${props.row.icon}`" size="sm" class="q-pr-sm" />{{ $t(col.value) }}
          </div>
          <div v-else-if="col.name === 'actions' && props.row.actions && props.row.actions.length > 0">
            <q-chip v-for="(item, index) in visibleArray(props.row.actions, 3)" :key="index" :label="$t(item as string)"
              :color="actions[item]" text-color="white" class="q-mr-sm" size="sm" />
            <template v-if="props.row.actions.length > 3">
              <q-chip color="primary" text-color="white" class="q-mr-sm" size="sm">
                + {{ props.row.actions.length - 3 }}
                <q-tooltip>
                  <q-chip v-for="(item, index) in props.row.actions.slice(3)" :key="index" :label="$t(item)"
                    :color="actions[item]" text-color="white" class="q-mr-sm" size="sm" />
                </q-tooltip>
              </q-chip>
            </template>
          </div>
          <div v-else-if="col.name === 'enabled'" class="text-center">
            <q-toggle v-model="props.row.enabled" @toogle="enableRow(props.row.id)" size="sm" color="positive" />
          </div>
          <span v-else>{{ col.value }}</span>
        </q-td>
      </q-tr>
      <q-tr v-show="props.expand" :props="props">
        <q-td colspan="100%" class="q-pr-none">
          <sub-page v-if="props.expand" :title="props.row.name" :superior-id="props.row.id" :options="options" />
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { QTableProps } from 'quasar'
import { retrievePrivilegeSubset, fetchPrivilege, modifyPrivilege, enablePrivilege } from 'src/api/privileges'
import { visibleArray } from 'src/utils'
import { actions } from 'src/constants'
import type { Privilege, Dictionary } from 'src/types'


const props = withDefaults(defineProps<{
  title: string
  superiorId?: number
  options: Array<Dictionary>
}>(), {
  title: ''
})

const visible = ref<boolean>(false)

const subTableRef = ref()
const rows = ref<QTableProps['rows']>([])
const filter = ref('')
const loading = ref<boolean>(false)

const initialValues: Privilege = {
  id: undefined,
  name: '',
  path: '',
  component: '',
  icon: '',
  actions: [],
  description: ''
}
const form = ref<Privilege>({ ...initialValues })

const columns: QTableProps['columns'] = [
  { name: 'name', label: 'name', align: 'left', field: 'name', sortable: true },
  { name: 'path', label: 'path', align: 'left', field: 'path', sortable: true },
  { name: 'actions', label: 'actions', align: 'left', field: 'actions' },
  { name: 'enabled', label: 'enabled', align: 'center', field: 'enabled' },
  { name: 'description', label: 'description', align: 'left', field: 'description' },
  { name: 'id', label: 'actions', field: 'id' }
]

const subset = ref<Array<Privilege>>()

onMounted(() => {
  subTableRef.value.requestServerInteraction()
})

/**
 * 查询列表
 */
async function onRequest() {
  loading.value = true

  if (props.superiorId) {
    retrievePrivilegeSubset(props.superiorId).then(res => {
      rows.value = res.data
    }).finally(() => {
      loading.value = false
    })
  }
}

function refresh() {
  subTableRef.value.requestServerInteraction()
}

async function enableRow(id: number) {
  enablePrivilege(id)
}

async function saveRow(id: number) {
  form.value = { ...initialValues }
  // You can populate the form with existing user data based on the id
  if (id) {
    fetchPrivilege(id).then(res => { form.value = res.data })
  }
  visible.value = true
}

function onSubmit() {
  if (form.value.id) {
    modifyPrivilege(form.value.id, form.value)
  }

  // Close the dialog after submitting
  visible.value = false
}
</script>
