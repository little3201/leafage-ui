<script setup lang="ts">
import { Icon } from "@iconify/vue";
import type {
  FormInstance,
  FormRules,
  TableInstance,
  TreeData,
  TreeInstance,
  TreeNodeData,
  UploadRequestOptions
} from "element-plus";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  createDictionary,
  disableDictionary,
  enableDictionary,
  importDictionaries,
  modifyDictionary,
  removeDictionary,
  retrieveDictionaries,
  retrieveDictionarySubset
} from "@/api/system/dictionaries";
import { actionTypes } from "@/constants";
import type { Dictionary, Filter, Pagination } from "@/types";
import { actionIcon, exportToCSV, hasAction } from "@/utils";
import { onMounted, reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const treeRef = ref<TreeInstance>();
const treeLoading = ref<boolean>(false);
const treeSelected = ref<string>("");
const filterText = ref("");

const loading = ref<boolean>(false);
const datas = ref<Array<Dictionary>>([]);
const total = ref<number>(0);

const tableRef = ref<TableInstance>();
const pagination = reactive<Pagination>({
  page: 1,
  size: 10
});

const saveLoading = ref<boolean>(false);
const visible = ref<boolean>(false);

const importLoading = ref<boolean>(false);
const exportLoading = ref<boolean>(false);

const filter = reactive<Filter<Dictionary>>({
  superiorId: { op: "eq", value: null },
  name: { op: "like", value: undefined }
});

const formRef = ref<FormInstance>();
const initialValues: Dictionary = {
  id: null,
  name: "",
  superiorId: null
};
const form = ref<Dictionary>({ ...initialValues });

const rules = reactive<FormRules<typeof form>>({
  name: [
    {
      required: true,
      message: t("placeholder.inputText", { field: t("label.name") }),
      trigger: "blur"
    }
  ]
});

onMounted(async () => {
  await load();
});

/**
 * 监听tree
 */
watch(
  () => filterText.value,
  val => {
    treeRef.value!.filter(val);
  }
);

/**
 * tree过滤
 */
const filterNode = (value: string, data: { [key: string]: string }) => {
  if (!value) return true;
  return data.name?.includes(value) ?? false;
};

/**
 * node 变化
 * @param data node节点
 */
async function onCurrentChange(data: TreeNodeData) {
  if (treeSelected.value === String(data.id)) {
    return;
  }
  treeSelected.value = String(data.id);
  filter.superiorId = {
    op: "eq",
    value: treeSelected.value ? Number(treeSelected.value) : null
  };
  pagination.page = 1;
  await load();
}

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
 * 加载tree
 */
async function loadTree(
  { data }: { data: TreeNodeData },
  resolve: (data: TreeData) => void
) {
  treeLoading.value = true;

  const superiorId = data.id ? Number(data.id) : null;
  const res = await retrieveDictionarySubset(superiorId);
  const treeData = res.data.map((element: Dictionary) => ({
    ...element,
    isLeaf: !(element.count && element.count > 0)
  }));
  resolve(treeData);

  treeLoading.value = false;
}

/**
 * 加载列表
 */
async function load() {
  loading.value = true;

  try {
    const res = await retrieveDictionaries(pagination, filter);
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
 * 刷新子节点
 * @param rowKey row key
 */
const refreshChildren = async (rowKey: number) => {
  const res = await retrieveDictionarySubset(rowKey);
  const treeData = res.data.map((element: Dictionary) => ({
    ...element,
    isLeaf: !(element.count && element.count > 0)
  }));

  treeRef.value?.updateKeyChildren(String(rowKey), treeData);
};

/**
 * 导出
 */
function exportRows() {
  exportLoading.value = true;

  const selectedRows = tableRef.value?.getSelectionRows();
  if (selectedRows && selectedRows.length) {
    exportToCSV(selectedRows, "dictionaries");
  } else {
    exportToCSV(datas.value, "dictionaries");
  }
  exportLoading.value = false;
}

/**
 * 弹出框
 * @param row 数据
 */
function saveRow(row?: Dictionary) {
  form.value = row ? { ...row } : { ...initialValues };

  visible.value = true;
}

/**
 * 启用
 * @param id 主键
 */
async function enableRow(id: number) {
  try {
    await enableDictionary(id);
    await load();
    ElMessage.success(t("message.success", { action: t("action.enable") }));
  } catch (error) {
    ElMessage.error(t("message.error", { action: t("action.enable") }));
    throw error;
  }
}

/**
 * 停用
 * @param id 主键
 */
async function disableRow(id: number) {
  await ElMessageBox.confirm(
    t("tips.disableWarning", { module: t("page.dictionaries"), data: name }),
    t("tips.confirm"),
    {
      dangerouslyUseHTMLString: true,
      showCancelButton: false,
      confirmButtonType: "danger",
      confirmButtonClass: "w-full",
      confirmButtonText: t("tips.disableButtonText"),
      type: "warning"
    }
  ).then(async () => {
    try {
      await disableDictionary(id);
      await load();
      ElMessage.success(t("message.success", { action: t("action.disable") }));
    } catch (error) {
      ElMessage.error(t("message.error", { action: t("action.disable") }));
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
      if (form.value.id) {
        await modifyDictionary(form.value.id, form.value);
      } else {
        form.value.superiorId = treeSelected.value
          ? Number(treeSelected.value)
          : null;
        await createDictionary(form.value);
      }
      visible.value = false;

      ElMessage.success(
        t("message.success", {
          action: form.value.id ? t("action.modify") : t("action.create")
        })
      );
      await load();

      if (form.value.superiorId) {
        await refreshChildren(form.value.superiorId);
      }
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
 * @param name 名称
 */
async function removeRow(id: number, name: string) {
  // 弹出确认框
  await ElMessageBox.confirm(
    t("tips.removeWarning", { module: t("page.dictionaries"), data: name }),
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
      await removeDictionary(id);
      await Promise.all([load(), refreshChildren(id)]);

      ElMessage.success(t("message.success", { action: t("action.remove") }));
    } catch (error) {
      ElMessage.error(t("message.error", { action: t("action.remove") }));
      throw error;
    }
  });
}

/**
 * 导入
 */
function onUpload(options: UploadRequestOptions) {
  return importDictionaries(options.file);
}
</script>

<template>
  <ElRow :gutter="16">
    <ElCol :span="6" :xl="4">
      <ElCard>
        <ElFormItem prop="filterText">
          <ElInput
            v-model="filterText"
            :placeholder="$t('action.search')"
            clearable
          >
            <template #prefix>
              <Icon
                :icon="actionIcon('search')"
                width="1.25em"
                height="1.25em"
              />
            </template>
          </ElInput>
        </ElFormItem>

        <ElTree
          ref="treeRef"
          :load="loadTree"
          lazy
          v-loading="treeLoading"
          node-key="id"
          :current-node-key="treeSelected"
          highlight-current
          :props="{ label: 'name', isLeaf: 'isLeaf' }"
          :filter-node-method="filterNode"
          @current-change="onCurrentChange"
        >
        </ElTree>
      </ElCard>
    </ElCol>

    <ElCol :span="18" :xl="20">
      <ElCard>
        <ElRow :gutter="20" justify="space-between" class="mb-4">
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
              v-if="treeSelected && hasAction($route.name, 'create')"
              title="create"
              :type="actionTypes['create']"
              @click="saveRow()"
            >
              <Icon
                :icon="actionIcon('create')"
                width="1.25em"
                height="1.25em"
              />{{ $t("action.create") }}
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
              <Icon
                :icon="actionIcon('export')"
                width="1.25em"
                height="1.25em"
              />{{ $t("action.export") }}
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
          <ElTableColumn type="index" :label="$t('label.no')" width="55" />
          <ElTableColumn prop="name" :label="$t('label.name')" />
          <ElTableColumn
            prop="enabled"
            :label="$t('label.enabled')"
            align="center"
            sortable
          >
            <template #default="scope">
              <ElBadge
                is-dot
                :type="scope.row.enabled ? 'success' : 'info'"
                class="mr-1"
              />
              <ElText :type="scope.row.enabled ? 'success' : 'info'">{{
                scope.row.enabled ? "Y" : "N"
              }}</ElText>
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
              <template v-if="scope.row.superiorId">
                <ElButton
                  v-if="scope.row.enabled && hasAction($route.name, 'disable')"
                  title="disable"
                  :type="actionTypes['disable']"
                  link
                  @click="disableRow(scope.row.id)"
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
                  @click="enableRow(scope.row.id)"
                >
                  <Icon
                    :icon="actionIcon('enable')"
                    width="1.25em"
                    height="1.25em"
                  />{{ $t("action.enable") }}
                </ElButton>
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
    </ElCol>
  </ElRow>

  <!-- form -->
  <ElDialog
    v-model="visible"
    :title="form.id ? $t('action.modify') : $t('action.create')"
    :show-close="false"
    width="400"
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-position="top">
      <ElRow :gutter="20">
        <ElCol :span="24">
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
</template>
