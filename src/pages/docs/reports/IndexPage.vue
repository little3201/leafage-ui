<script setup lang="ts">
import { Icon } from "@iconify/vue";
import type {
  FormInstance,
  FormRules,
  TableInstance,
  UploadRequestOptions
} from "element-plus";
import { dayjs, ElMessage, ElMessageBox } from "element-plus";
import {
  createReport,
  importReports,
  modifyReport,
  removeReport,
  retrieveReports
} from "@/api/docs/reports";
import { retrieveTemplates } from "@/api/docs/templates";
import { actionTypes } from "@/constants";
import type { Filter, Pagination, Report, Template } from "@/types";
import { actionIcon, exportToCSV, hasAction } from "@/utils";
import { onMounted, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import Section from "../templates/sections/IndexPage.vue";

const { t } = useI18n();
const loading = ref<boolean>(false);
const datas = ref<Array<Report>>([]);
const total = ref<number>(0);

const templates = ref<Array<Template>>([]);

const tableRef = ref<TableInstance>();
const pagination = reactive<Pagination>({
  page: 1,
  size: 10
});

const saveLoading = ref<boolean>(false);
const visible = ref<boolean>(false);
const previewVisible = ref<boolean>(false);
const fieldVisible = ref<boolean>(false);
const dataVisible = ref<boolean>(false);

const importLoading = ref<boolean>(false);
const exportLoading = ref<boolean>(false);

const filter = reactive<Filter<Report>>({
  title: { op: "like", value: undefined }
});

const formRef = ref<FormInstance>();
const initialValues: Report = {
  id: null,
  title: "",
  schemaId: null
};
const form = ref<Report>({ ...initialValues });

const rules = reactive<FormRules<typeof form>>({
  title: [
    {
      required: true,
      message: t("placeholder.inputText", { field: t("label.title") }),
      trigger: "blur"
    }
  ]
});

onMounted(async () => {
  await load();
  await loadTemplates();
});

/**
 * 分页变化
 * @param currentPage 当前页码
 * @param pageSize 分页大小
 */
async function pageChange(currentPage: number, pageSize: number) {
  pagination.page = currentPage;
  pagination.size = pageSize;
  await load();
}

/**
 * 加载列表
 */
async function load() {
  loading.value = true;

  try {
    const res = await retrieveReports(pagination, filter);
    datas.value = res.data.content;
    total.value = res.data.page.totalElements;
  } catch (error) {
    datas.value = [];
    total.value = 0;

    throw error;
  } finally {
    loading.value = false;
  }
}

/**
 * 加载 templates
 */
async function loadTemplates() {
  const filter: Filter<Template> = {
    type: { op: "eq", value: "EXCEL" }
  };
  try {
    const res = await retrieveTemplates({ page: 1, size: 10 }, filter);
    templates.value = res.data.content;
  } catch (error) {
    templates.value = [];

    throw error;
  }
}

/**
 * 详情
 * @param id 主键
 */
function showRow(row: Report) {
  form.value = { ...row };

  previewVisible.value = true;
}

/**
 * 弹出框
 * @param row 数据
 */
function saveRow(row?: Report) {
  form.value = row ? { ...row } : { ...initialValues };

  visible.value = true;
}

/**
 * 配置
 * @param id 主键
 */
function configSection(id: number) {
  form.value.id = id;
  fieldVisible.value = true;
}

/**
 * 数据维护
 * @param id 主键
 */
function configData(id: number) {
  if (!id) {
    return;
  }

  form.value.id = id;
  dataVisible.value = true;
}

/**
 * 表单提交
 */
async function onSubmit(formEl: FormInstance) {
  if (!formEl) return;

  const valid = await formEl.validate();
  if (valid) {
    saveLoading.value = true;
    try {
      if (form.value.id) {
        await modifyReport(form.value.id, form.value);
      } else {
        await createReport(form.value);
      }
      visible.value = false;

      ElMessage.success(
        t("message.success", {
          action: form.value.id ? t("action.modify") : t("action.create")
        })
      );
      await load();
    } catch (error) {
      ElMessage.error(
        t("message.error", {
          action: form.value.id ? t("action.modify") : t("action.create")
        })
      );
      throw error;
    } finally {
      saveLoading.value = false;
    }
  }
}

/**
 * 删除
 * @param id 主键
 * @param title 标题
 */
async function removeRow(id: number, title: string) {
  await ElMessageBox.confirm(
    t("tips.removeWarning", { module: t("page.reports"), data: title }),
    t("tips.confirm"),
    {
      dangerouslyUseHTMLString: true,
      showCancelButton: false,
      confirmButtonType: "danger",
      confirmButtonClass: "w-full",
      confirmButtonText: t("tips.removeButtonText"),
      type: "warning"
    }
  ).then(async () => {
    try {
      await removeReport(id);
      await load();

      ElMessage.success(t("message.success", { action: t("action.remove") }));
    } catch (error) {
      ElMessage.error(t("message.error", { action: t("action.remove") }));
      throw error;
    }
  });
}

/**
 * 导出
 */
function exportRows() {
  exportLoading.value = true;

  const selectedRows = tableRef.value?.getSelectionRows();
  if (selectedRows && selectedRows.length) {
    exportToCSV(selectedRows, "sections", t);
  } else {
    exportToCSV(datas.value, "sections", t);
  }
  exportLoading.value = false;
}

/**
 * 导入
 */
function onUpload(options: UploadRequestOptions) {
  return importReports(options.file);
}

/**
 * format templates
 * @param cellValue cell value
 */
function formatSchemas(cellValue: number): string {
  const matched = templates.value.find(item => item.id === cellValue);
  return matched ? matched.name : "";
}
</script>

<template>
  <ElCard>
    <ElRow :gutter="20" justify="space-between" class="mb-4">
      <ElCol :span="12">
        <ElInput
          v-model="filter.title!.value"
          clearable
          style="width: 240px"
          class="mr-4"
          :placeholder="$t('placeholder.search')"
        >
          <template #prefix>
            <Icon :icon="actionIcon('search')" width="1.25em" height="1.25em" />
          </template>
        </ElInput>
        <ElButton
          title="search"
          plain
          :type="actionTypes['search']"
          @click="load()"
        >
          <Icon :icon="actionIcon('search')" width="1.25em" height="1.25em" />{{
            $t("action.search")
          }}
        </ElButton>
      </ElCol>

      <ElCol :span="12" class="inline-flex! justify-end space-x-3">
        <ElButton
          v-if="hasAction($route.name, 'create')"
          title="create"
          :type="actionTypes['create']"
          @click="saveRow()"
        >
          <Icon :icon="actionIcon('create')" width="1.25em" height="1.25em" />{{
            $t("action.create")
          }}
        </ElButton>
        <ElUpload
          :limit="1"
          :auto-upload="false"
          :http-request="onUpload"
          :on-success="load"
          accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
        >
          <ElButton
            v-if="hasAction($route.name, 'import')"
            v-loading="importLoading"
            title="import"
            :type="actionTypes['import']"
            plain
          >
            <Icon
              :icon="actionIcon('import')"
              width="1.25em"
              height="1.25em"
            />{{ $t("action.import") }}
          </ElButton>
        </ElUpload>
        <ElButton
          v-if="hasAction($route.name, 'export')"
          title="export"
          :type="actionTypes['export']"
          plain
          @click="exportRows"
          :loading="exportLoading"
        >
          <Icon :icon="actionIcon('export')" width="1.25em" height="1.25em" />{{
            $t("action.export")
          }}
        </ElButton>
      </ElCol>
    </ElRow>

    <ElTable
      ref="tableRef"
      v-loading="loading"
      :data="datas"
      row-key="id"
      table-layout="auto"
    >
      <ElTableColumn type="selection" />
      <ElTableColumn type="index" :label="$t('label.serial')" width="55" />
      <ElTableColumn prop="title" :label="$t('label.title')">
        <template #default="scope">
          <ElButton
            title="details"
            type="primary"
            link
            @click="showRow(scope.row)"
          >
            {{ scope.row.title }}
          </ElButton>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="version" :label="$t('label.version')">
        <template #default="scope"> V{{ scope.row.version }} </template>
      </ElTableColumn>
      <ElTableColumn prop="schemaId" :label="$t('label.template')">
        <template #default="scope">
          {{ scope.row.schemaId ? formatSchemas(scope.row.schemaId) : "-" }}
        </template>
      </ElTableColumn>
      <ElTableColumn
        prop="lastModifiedDate"
        :label="$t('label.lastModifiedDate')"
        sortable
      >
        <template #default="scope">
          {{
            scope.row.lastModifiedDate
              ? dayjs(scope.row.lastModifiedDate).format("YYYY-MM-DD HH:mm")
              : "-"
          }}
        </template>
      </ElTableColumn>
      <ElTableColumn :label="$t('label.actions')">
        <template #default="scope">
          <ElButton
            v-if="hasAction($route.name, 'modify')"
            title="modify"
            :type="actionTypes['modify']"
            link
            @click="saveRow(scope.row)"
          >
            <Icon
              :icon="actionIcon('modify')"
              width="1.25em"
              height="1.25em"
            />{{ $t("action.modify") }}
          </ElButton>
          <ElButton
            v-if="hasAction($route.name, 'field')"
            title="config"
            :type="actionTypes['field']"
            link
            @click="configSection(scope.row.id)"
          >
            <Icon :icon="actionIcon('field')" width="1.25em" height="1.25em" />
            {{ $t("action.field") }}
          </ElButton>
          <ElButton
            v-if="hasAction($route.name, 'data')"
            title="data"
            :type="actionTypes['data']"
            link
            @click="configData(scope.row.id)"
          >
            <Icon :icon="actionIcon('data')" width="1.25em" height="1.25em" />
            {{ $t("action.data") }}
          </ElButton>
          <ElButton
            v-if="hasAction($route.name, 'remove')"
            title="remove"
            :type="actionTypes['remove']"
            link
            @click="removeRow(scope.row.id, scope.row.title)"
          >
            <Icon
              :icon="actionIcon('remove')"
              width="1.25em"
              height="1.25em"
            />{{ $t("action.remove") }}
          </ElButton>
        </template>
      </ElTableColumn>
    </ElTable>
    <ElPagination
      layout="slot, ->, total, prev, pager, next, sizes"
      @change="pageChange"
      :total="total"
    >
      <template #default>
        {{
          $t("message.selectedTotal", {
            total: tableRef?.getSelectionRows().length
          })
        }}
      </template>
    </ElPagination>
  </ElCard>

  <!-- form -->
  <ElDialog
    v-model="visible"
    :title="form.id ? $t('action.modify') : $t('action.create')"
    :show-close="false"
    width="400"
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-position="top">
      <ElRow :gutter="20">
        <ElCol>
          <ElFormItem :label="$t('label.title')" prop="title">
            <ElInput
              v-model="form.title"
              :placeholder="
                $t('placeholder.inputText', { field: $t('label.title') })
              "
            />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow :gutter="20">
        <ElCol>
          <ElFormItem :label="$t('label.template')" prop="schemaId">
            <ElSelect
              v-model="form.schemaId"
              :disabled="form.id != null"
              :options="templates"
              :props="{ value: 'id', label: 'name' }"
              :placeholder="
                $t('placeholder.selectText', { field: $t('label.template') })
              "
            />
          </ElFormItem>
        </ElCol>
      </ElRow>
    </ElForm>
    <template #footer>
      <ElButton title="cancel" @click="visible = false">
        <Icon :icon="actionIcon('cancel')" width="1.25em" height="1.25em" />{{
          $t("action.cancel")
        }}
      </ElButton>
      <ElButton
        title="submit"
        type="primary"
        :loading="saveLoading"
        @click="onSubmit(formRef!)"
      >
        <Icon :icon="actionIcon('submit')" width="1.25em" height="1.25em" />
        {{ $t("action.submit") }}
      </ElButton>
    </template>
  </ElDialog>

  <!-- field -->
  <ElDialog v-model="fieldVisible" :title="$t('action.field')">
    <Section
      ref="sectionRef"
      :owner-id="form.id"
      owner-type="REPORT"
      template-type="EXCEL"
      excel-mode="FIELD"
    />
  </ElDialog>

  <!-- data -->
  <ElDialog v-model="dataVisible" :title="$t('action.data')">
    <Section
      ref="sectionRef"
      :owner-id="form.id"
      owner-type="REPORT"
      read-only
      template-type="EXCEL"
      excel-mode="DATA"
    />
  </ElDialog>

  <!-- preview -->
  <ElDialog v-model="previewVisible" :title="$t('action.preview')">
    <Section
      :owner-id="form.id"
      owner-type="REPORT"
      template-type="EXCEL"
      excel-mode="RENDER"
      :read-only="true"
    />
  </ElDialog>
</template>
