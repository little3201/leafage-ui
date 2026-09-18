<template>
  <q-page padding>
    <q-dialog v-model="visible" persistent>
      <q-card style="min-width: 25em">
        <q-form @submit="onSubmit">
          <q-card-section>
            <div class="text-h6">{{
              form.id ? $t("action.modify") : $t("action.create")
            }}</div>
          </q-card-section>

          <q-card-section>
            <q-input
              outlined
              dense
              v-model="form.title"
              :label="$t('label.title')"
              lazy-rules
              :rules="[
                val => (val && val.length > 0) || $t('placeholder.inputText')
              ]"
            />
          </q-card-section>

          <q-card-actions align="right">
            <q-btn
              title="cancel"
              type="reset"
              unelevated
              :label="$t('action.cancel')"
              v-close-popup
            />
            <q-btn
              title="submit"
              type="submit"
              flat
              :label="$t('action.submit')"
              color="primary"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <q-dialog v-model="configVisible" persistent>
      <q-card class="full-width" style="max-width: 80em">
        <q-card-section style="height: 60vh">
          <DocRender :title="form.title" :data="'blank'" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            title="cancel"
            type="reset"
            unelevated
            :label="$t('action.cancel')"
            v-close-popup
          />
          <q-btn
            title="submit"
            type="submit"
            flat
            :label="$t('action.submit')"
            color="primary"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-table
      ref="tableRef"
      flat
      :title="$t('page.schemes')"
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
          v-model="filter.title!.value"
          clearable
          style="max-width: 200px"
          placeholder="Search"
        >
          <template v-slot:prepend>
            <q-icon :name="actionIcon('search')" />
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
          :icon="actionIcon('refresh')"
          @click="refresh"
        />
      </template>
      <template v-slot:top-right>
        <q-btn
          title="create"
          round
          padding="xs"
          class="q-mx-sm"
          color="primary"
          :disable="loading"
          :icon="actionIcon('create')"
          @click="saveRow()"
        />
        <q-btn
          title="import"
          round
          padding="xs"
          flat
          color="primary"
          class="q-mx-sm"
          :disable="loading"
          :icon="actionIcon('import')"
          @click="importRow"
        />
        <q-btn
          title="export"
          round
          padding="xs"
          flat
          color="primary"
          :icon="actionIcon('export')"
          @click="exportTable(columns, rows)"
        />
      </template>

      <template v-slot:header="props">
        <q-tr :props="props">
          <q-th v-for="col in props.cols" :key="col.name" :props="props">
            {{ $t(`label.${col.label}`) }}
          </q-th>
        </q-tr>
      </template>

      <template v-slot:body-cell-id="props">
        <q-td :props="props">
          <q-btn
            title="modify"
            padding="xs"
            flat
            round
            color="primary"
            :icon="actionIcon('modify')"
            @click="saveRow(props.row.id)"
          />
          <q-btn
            title="config"
            padding="xs"
            flat
            round
            color="primary"
            :icon="actionIcon('config')"
            @click="configRow(props.row)"
          />
          <q-btn
            title="remove"
            padding="xs"
            flat
            round
            color="negative"
            :icon="actionIcon('remove')"
            @click="removeRow(props.row.id)"
            class="q-mt-none q-ml-sm"
          />
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script setup lang="ts">
import {
  createArchive,
  fetchArchive,
  modifyArchive,
  removeArchive,
  retrieveArchives
} from "@/api/docs/archives";
import DocRender from "@/components/DocRender.vue";
import type { Archive, Filter, Pagination } from "@/types";
import { exportTable, actionIcon } from "@/utils";
import type { QTable, QTableColumn, QTableProps } from "quasar";
import { Notify } from "quasar";
import { onMounted, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const visible = ref<boolean>(false);
const configVisible = ref<boolean>(false);
const importVisible = ref<boolean>(false);

const tableRef = ref<QTable>();
const rows = ref<Array<Archive>>([]);
const filter = reactive<Filter<Archive>>({
  title: { op: "eq", value: undefined }
});
const loading = ref<boolean>(false);

const initialValues: Archive = {
  id: null,
  title: "",
  schemaId: null
};
const form = ref<Archive>({ ...initialValues });

const pagination = ref({
  sortBy: "",
  descending: true,
  page: 1,
  rowsPerPage: 7,
  rowsNumber: 0
});

const columns: QTableColumn<Archive>[] = [
  {
    name: "title",
    label: "title",
    align: "left",
    field: "title",
    sortable: true
  },
  { name: "owner", label: "owner", align: "left", field: "owner" },
  { name: "version", label: "version", align: "left", field: "version" },
  { name: "id", label: "actions", field: "id" }
];

onMounted(() => {
  refresh();
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
    const res = await retrieveArchives(params, filter);
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

async function saveRow(id?: number) {
  form.value = { ...initialValues };
  if (id) {
    try {
      const res = await fetchArchive(id);
      form.value = res.data;
    } catch (error) {
      form.value = { ...initialValues };
      throw error;
    }
  }
  visible.value = true;
}

async function configRow(row: Archive) {
  form.value = { ...row };
  configVisible.value = true;
}

function importRow() {
  importVisible.value = true;
}

async function removeRow(id: number) {
  try {
    await removeArchive(id);
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

async function onSubmit() {
  try {
    if (form.value.id) {
      await modifyArchive(form.value.id, form.value);
    } else {
      await createArchive(form.value);
    }
    // Close the dialog after submitting
    visible.value = false;
    Notify.create({
      message: t("message.success", {
        action: form.value.id ? t("action.modify") : t("action.create")
      }),
      type: "positive"
    });

    refresh();
  } catch (error) {
    Notify.create({
      message: t("message.error", {
        action: form.value.id ? t("action.modify") : t("action.create")
      }),
      type: "negative"
    });
    throw error;
  }
}
</script>
