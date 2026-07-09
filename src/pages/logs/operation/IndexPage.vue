<template>
  <q-page padding>
    <q-dialog v-model="visible" persistent>
      <q-card>
        <q-card-section class="flex items-center q-pb-none">
          <div class="text-h6">{{ $t("page.operationLogs") }}</div>
          <q-space />
          <q-btn icon="sym_r_close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div class="row q-gutter-md">
            <p
              ><strong>{{ $t("label.module") }}</strong
              >{{ row.module }}</p
            >
            <p
              ><strong>{{ $t("label.actions") }}</strong
              >{{ row.action }}</p
            >
            <p>
              <strong>{{ $t("label.status") }}</strong>
              <q-chip
                size="sm"
                :color="row.status === 'SUCCEED' ? 'positive' : 'negative'"
                text-color="white"
              >
                {{ row.status }}
              </q-chip>
            </p>
          </div>

          <div class="q-gutter-md">
            <p
              ><strong>{{ $t("label.params") }}</strong>
              {{ row.params }}
            </p>
            <p
              ><strong>{{ $t("label.response") }}</strong>
              {{ row.response }}
            </p>
            <p
              ><strong>{{ $t("label.status") }}</strong>
              {{ row.status }}
            </p>
          </div>

          <div class="row q-gutter-md">
            <p
              ><strong>{{ $t("label.duration") }}</strong>
              {{ row.duration ? formatDuration(row.duration) : "" }}
            </p>
            <p
              ><strong>{{ $t("label.operator") }}</strong>
              {{ row.operator }}
            </p>
          </div>
          <div class="row q-gutter-md">
            <p
              ><strong>{{ $t("label.operatedAt") }}</strong>
              {{ row.operatedAt }}
            </p>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-table
      ref="tableRef"
      flat
      selection="multiple"
      v-model:selected="selected"
      :rows="rows"
      :columns="columns"
      row-key="id"
      v-model:pagination="pagination"
      :loading="loading"
      :filter="filter"
      binary-state-sort
      @request="onRequest"
      class="full-width"
    >
      <template v-slot:top-left>
        <q-input
          dense
          debounce="300"
          filled
          v-model="filter.module!.value"
          placeholder="Search"
        >
          <template v-slot:prepend>
            <q-icon name="sym_r_search" />
          </template>
        </q-input>
        <q-btn
          title="refresh"
          round
          padding="xs"
          flat
          color="primary"
          class="q-ml-sm"
          :disable="loading"
          icon="sym_r_refresh"
          @click="refresh"
        />
      </template>
      <template v-slot:top-right>
        <q-btn
          title="clear"
          round
          padding="xs"
          flat
          color="negative"
          class="q-mx-sm"
          icon="sym_r_clear_all"
        />
        <q-btn
          title="export"
          round
          padding="xs"
          flat
          color="primary"
          icon="sym_r_file_export"
          @click="exportTable(columns, rows)"
        />
      </template>

      <template v-slot:header="props">
        <q-tr :props="props">
          <q-th auto-width />
          <q-th v-for="col in props.cols" :key="col.name" :props="props">
            <span v-if="col.label === 'body'">{{
              $t("label.request.body")
            }}</span>
            <span v-else>{{ $t(`label.${col.label}`) }}</span>
          </q-th>
        </q-tr>
      </template>

      <template v-slot:body-cell-module="props">
        <q-td :props="props">
          <q-btn
            :title="props.row.module"
            flat
            no-caps
            padding="none"
            color="primary"
            @click="showRow(props.row.id)"
          >
            {{ props.row.module }}
          </q-btn>
        </q-td>
      </template>
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-badge
            :color="actionTypes[props.row.action]"
            rounded
            class="q-mr-sm"
          />
          {{ props.row.action }}
        </q-td>
      </template>
      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <q-chip
            size="sm"
            :color="props.row.status === 'SUCCEED' ? 'positive' : 'negative'"
            text-color="white"
          >
            {{ props.row.status }}
          </q-chip>
        </q-td>
      </template>
      <template v-slot:body-cell-duration="props">
        <q-td :props="props">
          {{ props.row.duration ? formatDuration(props.row.duration) : "" }}
        </q-td>
      </template>
      <template v-slot:body-cell-operatedAt="props">
        <q-td :props="props">
          {{
            props.row.operatedAt
              ? date.formatDate(props.row.operatedAt, "YYYY-MM-DD HH:mm")
              : "-"
          }}
        </q-td>
      </template>
      <template v-slot:body-cell-id="props">
        <q-td :props="props">
          <q-btn
            title="remove"
            padding="xs"
            flat
            round
            color="negative"
            icon="sym_r_delete"
            @click="removeRow(props.row.id)"
          />
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script setup lang="ts">
import {
  fetchOperationLog,
  removeOperationLog,
  retrieveOperationLogs
} from "@/api/logs/operation-logs";
import { actionTypes } from "@/constants";
import type { Filter, OperationLog, Pagination } from "@/types";
import { exportTable, formatDuration } from "@/utils";
import type { QTable, QTableColumn, QTableProps } from "quasar";
import { Notify, date } from "quasar";
import { onMounted, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const visible = ref<boolean>(false);

const tableRef = ref<QTable>();
const rows = ref<Array<OperationLog>>([]);
const filter = reactive<Filter<OperationLog>>({
  module: { op: "eq", value: undefined },
  action: { op: "eq", value: undefined }
});
const loading = ref<boolean>(false);

const initialValues: OperationLog = {
  id: null,
  module: "",
  action: "",
  params: ""
};
const row = ref<OperationLog>({ ...initialValues });

const pagination = ref({
  sortBy: "",
  descending: true,
  page: 1,
  rowsPerPage: 7,
  rowsNumber: 0
});

const selected = ref([]);

const columns: QTableColumn<OperationLog>[] = [
  { name: "module", label: "module", align: "left", field: "module" },
  { name: "actions", label: "actions", align: "left", field: "action" },
  { name: "params", label: "params", align: "left", field: "params" },
  { name: "response", label: "response", align: "left", field: "response" },
  { name: "status", label: "status", align: "center", field: "status" },
  { name: "duration", label: "duration", align: "center", field: "duration" },
  { name: "operator", label: "operator", align: "center", field: "operator" },
  {
    name: "operatedAt",
    label: "operatedAt",
    align: "center",
    field: "operatedAt"
  },
  { name: "id", label: "actions", field: "id" }
];

onMounted(() => {
  tableRef.value?.requestServerInteraction();
});

/**
 * 查询列表
 */
async function onRequest(
  props: Parameters<NonNullable<QTableProps["onRequest"]>>[0]
) {
  loading.value = true;

  const { page, rowsPerPage, sortBy, descending } = props.pagination;
  const params: Pagination = { page, size: rowsPerPage };
  if (sortBy) {
    params.sortBy = sortBy;
    params.descending = descending;
  }

  try {
    const res = await retrieveOperationLogs(params, filter);
    pagination.value.page = page;
    pagination.value.rowsPerPage = rowsPerPage;
    pagination.value.sortBy = sortBy;
    pagination.value.descending = descending;

    rows.value = res.data.content;
    pagination.value.rowsNumber = res.data.totalElements;
  } catch (error) {
    rows.value = [];
    pagination.value.rowsNumber = 0;

    throw error;
  } finally {
    loading.value = false;
  }
}

function refresh() {
  tableRef.value?.requestServerInteraction();
}

async function showRow(id: number) {
  try {
    const res = await fetchOperationLog(id);
    row.value = res.data;
  } catch (error) {
    row.value = { ...initialValues };
    throw error;
  }
  visible.value = true;
}

async function removeRow(id: number) {
  try {
    await removeOperationLog(id);
    refresh();
    Notify.create({
      message: t("message.success", { action: t("action.remove") }),
      type: "positive"
    });
  } catch (error) {
    Notify.create({
      message: t("message.error", { action: t("action.remove") }),
      type: "negative"
    });
    throw error;
  }
}
</script>
