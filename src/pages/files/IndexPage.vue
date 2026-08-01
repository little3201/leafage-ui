<script setup lang="ts">
import { Icon } from "@iconify/vue";
import type {
  FormInstance,
  UploadRequestOptions,
  FormRules
} from "element-plus";
import { dayjs, ElMessage, ElMessageBox } from "element-plus";
import {
  disableFile,
  downloadFile,
  enableFile,
  createDirectory,
  removeFile,
  retrieveFiles,
  statisticsFile,
  uploadFile
} from "@/api/file-records";
import { actionTypes, globalIcons, fileTypes } from "@/constants";
import type { FileRecord, Filter, Pagination, FileStatistics } from "@/types";
import {
  actionIcon,
  download,
  formatFileSize,
  hasAction,
  loadIcon
} from "@/utils";
import { onMounted, reactive, ref, computed } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const visible = ref<boolean>(false);
const detailsVisible = ref<boolean>(false);
const loading = ref<boolean>(false);
const saveLoading = ref<boolean>(false);
const uploadLoading = ref<boolean>(false);
const datas = ref<Array<FileRecord>>([]);
const total = ref<number>(0);
const expandRows = ref<Array<FileRecord>>([]);
const currentRowId = ref<number | null>(null);

const pagination = reactive<Pagination>({
  page: 1,
  size: 10
});

const filter = reactive<Filter<FileRecord>>({
  superiorId: { op: "eq", value: currentRowId.value },
  name: { op: "like", value: undefined }
});

const formRef = ref<FormInstance>();
const initialValues: FileRecord = {
  id: null,
  superiorId: null,
  name: "",
  size: 0,
  path: "",
  directory: false
};
const form = ref<FileRecord>({ ...initialValues });

const rules = reactive<FormRules<typeof form>>({
  name: [
    {
      required: true,
      message: t("placeholder.inputText", { field: t("label.name") }),
      trigger: "blur"
    }
  ]
});

const statistics = ref<Array<FileStatistics>>([]);
// 总大小
const totalSize = computed(() =>
  statistics.value.reduce((sum, item) => sum + item.size, 0)
);

onMounted(() => {
  loadData();
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
    const res = await retrieveFiles(pagination, filter);
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

async function loadStatistics() {
  try {
    const res = await statisticsFile();
    statistics.value = res.data;
  } catch (error) {
    statistics.value = [];
    throw error;
  }
}

async function loadData() {
  uploadLoading.value = false;
  await load();
  await loadStatistics();
}

/**
 * 创建文件夹
 */
function saveDirectory() {
  form.value = { ...initialValues };
  visible.value = true;
}

/**
 * 详情
 * @param id 主键
 */
function showRow(row: FileRecord) {
  form.value = { ...row };

  detailsVisible.value = true;
}

/**
 * 启用
 * @param row 数据
 */
async function enableRow(row: FileRecord) {
  const id = row.id;
  if (!id) return;

  try {
    const res = await enableFile(id);
    if (res.data) {
      row.enabled = true;
    }
    ElMessage.success(t("message.success", { action: t("action.enable") }));
  } catch (error) {
    ElMessage.error(t("message.error", { action: t("action.enable") }));
    throw error;
  }
}

/**
 * 停用
 * @param row 数据
 */
async function disableRow(row: FileRecord) {
  const id = row.id;
  if (!id) return;

  await ElMessageBox.confirm(t("tips.disableWarning"), t("tips.confirm"), {
    showCancelButton: false,
    confirmButtonType: "danger",
    confirmButtonClass: "w-full",
    confirmButtonText: t("tips.disableButtonText"),
    type: "warning"
  }).then(async () => {
    try {
      const res = await disableFile(id);
      if (res.data) {
        row.enabled = false;
      }
      ElMessage.success(t("message.success", { action: t("action.disable") }));
    } catch (error) {
      ElMessage.error(t("message.error", { action: t("action.disable") }));
      throw error;
    }
  });
}

/**
 * 下载
 * @param id 主键
 */
async function downloadRow(id: number, name: string, type: string) {
  try {
    const res = await downloadFile(id);
    download(res.data, name, type);
  } catch (error) {
    ElMessage.error(t("message.error", { action: t("action.download") }));
    throw error;
  }
}

/**
 * 提交
 */
function onUpload(options: UploadRequestOptions) {
  uploadLoading.value = true;
  return uploadFile(options.file, currentRowId.value);
}

/**
 * 删除
 * @param id 主键
 * @param name 文件名称
 */
async function removeRow(id: number, name: string) {
  await ElMessageBox.confirm(
    t("tips.removeWarning", { module: t("page.files"), data: name }),
    t("tips.confirm"),
    {
      showCancelButton: false,
      confirmButtonType: "danger",
      confirmButtonClass: "w-full",
      confirmButtonText: t("tips.removeButtonText"),
      type: "warning"
    }
  ).then(async () => {
    try {
      await removeFile(id);
      await loadData();

      ElMessage.success(t("message.success", { action: t("action.remove") }));
    } catch (error) {
      ElMessage.error(t("message.error", { action: t("action.remove") }));
      throw error;
    }
  });
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
      await createDirectory(currentRowId.value, form.value.name);
      visible.value = false;

      ElMessage.success(
        t("message.success", {
          action: t("action.create")
        })
      );
      await loadData();
    } catch (error) {
      ElMessage.error(
        t("message.error", {
          action: t("action.create")
        })
      );
      throw error;
    } finally {
      saveLoading.value = false;
    }
  }
}

async function onRowClick(row: FileRecord) {
  if (!row.id) return;

  if (row.directory) {
    currentRowId.value = row.id;
    if (row) {
      expandRows.value.push(row);
    }
    // 设置 filter的superiorId为当前row的id
    if (filter.superiorId) {
      filter.superiorId.value = row.id;
    }
    await load();
  } else {
    showRow(row);
  }
}

async function handleBreadcrumbClick(index: number) {
  if (index === -1) {
    // 点击"全部文件夹"，回到根目录
    expandRows.value = [];
    currentRowId.value = null;
  } else {
    // 截断面包屑数组，保留点击位置及之前的部分
    expandRows.value = expandRows.value.slice(0, index + 1);
    currentRowId.value = expandRows.value[index]?.id || null;
  }
  if (filter.superiorId) {
    filter.superiorId.value = currentRowId.value;
  }
  await load();
}

function onUploadError() {
  uploadLoading.value = false;
  ElMessage.error(t("message.error", { action: t("action.upload") }));
}
</script>

<template>
  <ElRow :gutter="16">
    <ElCol :span="6" :xl="4">
      <ElCard>
        <p class="mt-0"><strong>Space Usage</strong></p>
        <div class="text-center my-6">
          <ElProgress
            type="dashboard"
            :percentage="(totalSize / 53687091200) * 100"
            :stroke-width="16"
            :width="220"
          >
            <template #default>
              <span class="block text-sm">Free Space</span>
              <span class="block mt-2">
                {{ formatFileSize(53687091200 - totalSize) }}
              </span>
            </template>
          </ElProgress>
          <div>Total Space: 50G</div>
        </div>
        <ul
          class="flex flex-col list-none px-0 divide-y divide-(--el-border-color)"
        >
          <li
            v-for="item in statistics"
            :key="item.key"
            :index="item.key"
            class="inline-flex items-center space-x-2 py-2"
          >
            <ElButton
              title="images"
              circle
              :type="fileTypes[item.key.toLowerCase()]"
              size="large"
            >
              <Icon
                :icon="loadIcon(globalIcons[item.key.toLowerCase()])"
                width="1.5em"
                height="1.5em"
              />
            </ElButton>
            <div class="inline-flex flex-1 flex-col">
              <span>{{ item.key }}</span>
              <span class="text-xs text-(--el-text-color-secondary)">
                {{ item.count }} files
              </span>
            </div>
            <span class="text-(--el-text-color-regular)">{{
              formatFileSize(item.size)
            }}</span>
          </li>
        </ul>
      </ElCard>
    </ElCol>

    <ElCol :span="18" :xl="20">
      <ElCard>
        <ElRow>
          <ElCol :span="23" class="text-left">
            <ElBreadcrumb class="cursor-pointer font-bold">
              <ElBreadcrumbItem @click="handleBreadcrumbClick(-1)">
                {{ $t("label.all") }}
              </ElBreadcrumbItem>
              <ElBreadcrumbItem
                v-for="(row, index) in expandRows"
                :key="index"
                @click="handleBreadcrumbClick(index)"
              >
                {{ row.name }}
              </ElBreadcrumbItem>
            </ElBreadcrumb>
          </ElCol>
        </ElRow>

        <ElRow :gutter="20" class="mt-4">
          <ElCol :span="12">
            <ElInput
              v-model="filter.name!.value"
              clearable
              style="width: 240px"
              class="mr-4"
              :placeholder="$t('placeholder.search')"
            >
              <template #prefix>
                <Icon
                  :icon="actionIcon('search')"
                  width="1.25em"
                  height="1.25em"
                />
              </template>
            </ElInput>
            <ElButton
              title="search"
              plain
              :type="actionTypes['search']"
              @click="load()"
            >
              <Icon
                :icon="actionIcon('search')"
                width="1.25em"
                height="1.25em"
              />{{ $t("action.search") }}
            </ElButton>
          </ElCol>

          <ElCol :span="12" class="inline-flex! justify-end space-x-3">
            <ElButton
              title="create"
              plain
              :type="actionTypes['create']"
              @click="saveDirectory()"
            >
              <Icon
                :icon="actionIcon('create')"
                width="1.25em"
                height="1.25em"
              />{{ $t("action.create") }}{{ $t("label.directory") }}
            </ElButton>
            <ElUpload
              multiple
              :show-file-list="false"
              :http-request="onUpload"
              :on-success="() => loadData()"
              :on-error="onUploadError"
            >
              <ElButton
                v-if="hasAction($route.name, 'upload')"
                :loading="uploadLoading"
                title="upload"
                type="primary"
              >
                <Icon
                  :icon="actionIcon('upload')"
                  width="1.25em"
                  height="1.25em"
                />{{ $t("action.upload") }}
              </ElButton>
            </ElUpload>
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
          <ElTableColumn
            show-overflow-tooltip
            prop="name"
            :label="$t('label.name')"
            sortable
          >
            <template #default="scope">
              <ElButton
                title="name"
                :type="scope.row.directory ? 'default' : 'primary'"
                link
                @click="onRowClick(scope.row)"
              >
                <span>
                  {{ scope.row.name }}
                </span>
              </ElButton>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="size" :label="$t('label.size')" sortable>
            <template #default="scope">
              {{ formatFileSize(scope.row.size) }}
            </template>
          </ElTableColumn>
          <ElTableColumn
            show-overflow-tooltip
            prop="contentType"
            :label="$t('label.contentType')"
          />
          <ElTableColumn prop="enabled" :label="$t('label.enabled')" sortable>
            <template #default="scope">
              <ElBadge
                is-dot
                :type="scope.row.enabled ? 'success' : 'info'"
                class="mr-1"
              />
              <ElText :type="scope.row.enabled ? 'success' : 'info'">{{
                scope.row.enabled ? $t("label.yes") : $t("label.no")
              }}</ElText>
            </template>
          </ElTableColumn>
          <ElTableColumn
            show-overflow-tooltip
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
              <template v-if="scope.row.directory === false">
                <ElButton
                  v-if="scope.row.enabled && hasAction($route.name, 'disable')"
                  title="disable"
                  :type="actionTypes['disable']"
                  link
                  @click="disableRow(scope.row)"
                >
                  <Icon
                    :icon="actionIcon('disable')"
                    width="1.25em"
                    height="1.25em"
                  />{{ $t("action.disable") }}
                </ElButton>
                <ElButton
                  v-else-if="hasAction($route.name, 'enable')"
                  title="enable"
                  :type="actionTypes['enable']"
                  link
                  @click="enableRow(scope.row)"
                >
                  <Icon
                    :icon="actionIcon('enable')"
                    width="1.25em"
                    height="1.25em"
                  />{{ $t("action.enable") }}
                </ElButton>
                <ElButton
                  v-if="scope.row.enabled && hasAction($route.name, 'download')"
                  title="download"
                  type="success"
                  link
                  @click="
                    downloadRow(scope.row.id, scope.row.name, scope.row.type)
                  "
                >
                  <Icon
                    :icon="actionIcon('download')"
                    width="1.25em"
                    height="1.25em"
                  />{{ $t("action.download") }}
                </ElButton>
              </template>
              <ElButton
                v-if="hasAction($route.name, 'remove')"
                title="remove"
                :type="actionTypes['remove']"
                link
                @click="removeRow(scope.row.id, scope.row.name)"
              >
                <Icon
                  :icon="actionIcon('remove')"
                  width="1.25em"
                  height="1.25em"
                />
                {{ $t("action.remove") }}
              </ElButton>
            </template>
          </ElTableColumn>
        </ElTable>
        <ElPagination
          layout="->, total, prev, pager, next, sizes"
          @change="pageChange"
          :total="total"
        />
      </ElCard>
    </ElCol>
  </ElRow>

  <!-- form -->
  <ElDialog
    v-model="visible"
    :title="$t('action.create')"
    :show-close="false"
    width="400"
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-position="top">
      <ElRow :gutter="20">
        <ElCol>
          <ElFormItem :label="$t('label.name')" prop="name">
            <ElInput
              v-model="form.name"
              :placeholder="
                $t('placeholder.inputText', { field: $t('label.name') })
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

  <!-- details -->
  <ElDialog v-model="detailsVisible" :title="$t('action.details')" width="400">
    <div class="text-center">
      <ElImage
        v-if="form.contentType && form.contentType.includes('image')"
        :src="form.path"
        class="w-full h-52 border border-(--el-border-color) rounded-(--el-border-radius-base) overflow-hidden"
      />
      <h1 v-else>
        {{ form.extension?.substring(1) }}
      </h1>
    </div>
    <ElDescriptions :column="1" class="mt-4">
      <ElDescriptionsItem :label="$t('label.name')">{{
        form.name
      }}</ElDescriptionsItem>
      <ElDescriptionsItem :label="$t('label.size')">{{
        formatFileSize(form.size)
      }}</ElDescriptionsItem>
      <ElDescriptionsItem :label="$t('label.contentType')">{{
        form.contentType
      }}</ElDescriptionsItem>
      <ElDescriptionsItem :label="$t('label.lastModifiedDate')">
        {{
          form.lastModifiedDate
            ? dayjs(form.lastModifiedDate).format("YYYY-MM-DD HH:mm")
            : "-"
        }}
      </ElDescriptionsItem>
    </ElDescriptions>
  </ElDialog>
</template>
