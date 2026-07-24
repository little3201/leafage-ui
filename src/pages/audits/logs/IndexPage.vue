<script setup lang="ts">
import { Icon } from "@iconify/vue";
import type { TableInstance } from "element-plus";
import { retrieveAuditLogs } from "@/api/audits/logs";
import { actionTypes } from "@/constants";
import type { AuditLog, Filter, Pagination } from "@/types";
import { actionIcon, exportToCSV, formatDuration, hasAction } from "@/utils";
import { onMounted, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const loading = ref<boolean>(false);
const datas = ref<Array<AuditLog>>([]);
const total = ref<number>(0);

const tableRef = ref<TableInstance>();
const pagination = reactive<Pagination>({
  page: 1,
  size: 10,
  descending: true
});

const filter = reactive<Filter<AuditLog>>({
  module: { op: "eq", value: undefined }
});

const exportLoading = ref<boolean>(false);
const initialValues: AuditLog = {
  id: null,
  module: "",
  action: ""
};
const data = ref<AuditLog>({ ...initialValues });

const visible = ref<boolean>(false);

onMounted(async () => {
  await load();
});

/**
 * 分页变化
 * @param value 当前页码
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
    const res = await retrieveAuditLogs(pagination, filter);
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
 * 导出
 */
function exportRows() {
  exportLoading.value = true;

  const selectedRows = tableRef.value?.getSelectionRows();
  if (selectedRows && selectedRows.length) {
    exportToCSV(selectedRows, "audit-logs");
  } else {
    exportToCSV(datas.value, "audit-logs");
  }
  exportLoading.value = false;
}

/**
 * 详情
 * @param row 数据
 */
function showRow(row: AuditLog) {
  data.value = row ? { ...row } : { ...initialValues };

  visible.value = true;
}
</script>

<template>
  <ElCard>
    <ElRow :gutter="20" justify="space-between" class="mb-4">
      <ElCol :span="12">
        <ElInput
          v-model="filter.module!.value"
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
      <ElTableColumn type="index" :label="$t('label.serial')" width="55" />
      <ElTableColumn prop="module" :label="$t('label.module')" sortable>
        <template #default="scope">
          <ElButton
            title="module"
            type="primary"
            link
            @click="showRow(scope.row)"
          >
            {{ scope.row.module }}
          </ElButton>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="action" :label="$t('label.actions')" sortable>
        <template #default="scope">
          <ElBadge is-dot :type="actionTypes[scope.row.action]" class="mr-1" />
          <ElText :type="actionTypes[scope.row.action]">{{
            $t(`action.${scope.row.action}`)
          }}</ElText>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="targetId" :label="$t('label.targetId')" />
      <ElTableColumn
        show-overflow-tooltip
        prop="oldValue"
        :label="$t('label.oldValue')"
      >
        <template #default="scope">
          <ElText class="w-56" truncated>{{ scope.row.oldValue }}</ElText>
        </template>
      </ElTableColumn>
      <ElTableColumn
        show-overflow-tooltip
        prop="newValue"
        :label="$t('label.newValue')"
      >
        <template #default="scope">
          <ElText class="w-56" truncated>{{ scope.row.newValue }}</ElText>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="ip" :label="$t('label.ip')" sortable />
      <ElTableColumn prop="status" :label="$t('label.status')" sortable>
        <template #default="scope">
          <ElTag
            :type="scope.row.status === 'SUCCEED' ? 'success' : 'danger'"
            round
            >{{ scope.row.status }}</ElTag
          >
        </template>
      </ElTableColumn>
      <ElTableColumn prop="duration" :label="$t('label.duration')">
        <template #default="scope">
          {{ formatDuration(scope.row.duration) }}
        </template>
      </ElTableColumn>
    </ElTable>
    <ElPagination
      layout="->, total, prev, pager, next, sizes"
      @change="pageChange"
      :total="total"
    />
  </ElCard>

  <!-- detail -->
  <ElDialog v-model="visible" :title="$t('action.details')" width="600">
    <ElDescriptions border>
      <ElDescriptionsItem :label="$t('label.module')">{{
        data.module
      }}</ElDescriptionsItem>
      <ElDescriptionsItem :label="$t('label.actions')">
        <ElBadge is-dot :type="actionTypes[data.action]" class="mr-1" />
        <ElText :type="actionTypes[data.action]">{{
          $t(`action.${data.action}`)
        }}</ElText>
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="$t('label.status')">
        <ElTag :type="data.status == 'SUCCEED' ? 'success' : 'danger'" round>{{
          data.status
        }}</ElTag>
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="$t('label.targetId')">{{
        data.targetId
      }}</ElDescriptionsItem>
      <ElDescriptionsItem :label="$t('label.ip')" :span="2">{{
        data.ip
      }}</ElDescriptionsItem>
      <ElDescriptionsItem :label="$t('label.oldValue')" :span="3">
        <ElText class="w-96" truncated>{{ data.oldValue }}</ElText>
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="$t('label.newValue')" :span="3">
        <ElText class="w-96" truncated>{{ data.newValue }}</ElText>
      </ElDescriptionsItem>
      <ElDescriptionsItem :span="3" :label="$t('label.duration')">
        {{ data.duration ? formatDuration(data.duration) : "" }}
      </ElDescriptionsItem>
    </ElDescriptions>
  </ElDialog>
</template>
