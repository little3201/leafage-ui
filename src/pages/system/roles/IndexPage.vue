<script setup lang="ts">
import { Icon } from "@iconify/vue";
import type {
  FormInstance,
  FormRules,
  TableInstance,
  UploadRequestOptions
} from "element-plus";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  authorize,
  createRole,
  disableRole,
  enableRole,
  importRoles,
  modifyRole,
  removeRole,
  retrieveRolePrivileges,
  retrieveRoles
} from "@/api/system/roles";
import { actionIcons, actionTypes } from "@/constants";
import type { Filter, Pagination, PrivilegeActions, Role } from "@/types";
import { actionIcon, exportToCSV, hasAction } from "@/utils";
import { onMounted, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import AuthorizeConfig from "../privileges/AuthorizeConfig.vue";

const { t } = useI18n();

const loading = ref<boolean>(false);
const datas = ref<Array<Role>>([]);
const total = ref<number>(0);

const tableRef = ref<TableInstance>();
const pagination = reactive<Pagination>({
  page: 1,
  size: 10
});

const saveLoading = ref<boolean>(false);
const visible = ref<boolean>(false);

const authorizeRef = ref<InstanceType<typeof AuthorizeConfig>>();
const authorizeVisible = ref<boolean>(false);
const authorities = ref<Array<PrivilegeActions>>([]);

const importLoading = ref<boolean>(false);
const exportLoading = ref<boolean>(false);

const filter = reactive<Filter<Role>>({
  name: { op: "like", value: undefined }
});

const formRef = ref<FormInstance>();
const initialValues: Role = {
  id: null,
  name: "",
  code: ""
};
const form = ref<Role>({ ...initialValues });

const rules = reactive<FormRules<typeof form>>({
  name: [
    {
      required: true,
      message: t("placeholder.inputText", { field: t("label.name") }),
      trigger: "blur"
    }
  ],
  code: [
    {
      required: true,
      message: t("placeholder.inputText", { field: t("label.code") }),
      trigger: "blur"
    }
  ]
});

onMounted(async () => {
  await load();
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
    const res = await retrieveRoles(pagination, filter);
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
 * 认证弹出框
 * @param id 主键
 */
async function authorizeRow(id: number) {
  authorities.value = [];
  form.value.id = id;

  try {
    const res = await retrieveRolePrivileges(id);
    authorities.value = res.data;
  } catch (error) {
    authorities.value = [];

    throw error;
  }

  authorizeVisible.value = true;
}

/**
 * 弹出框
 * @param row 数据
 */
function saveRow(row?: Role) {
  form.value = row ? { ...row } : { ...initialValues };

  visible.value = true;
}

/**
 * 启用
 * @param row 数据
 */
async function enableRow(row: Role) {
  const id = row.id;
  if (!id) return;

  try {
    const res = await enableRole(id);
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
async function disableRow(row: Role) {
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
      const res = await disableRole(id);
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
 * 表单提交
 */
async function onSubmit(formEl: FormInstance) {
  if (!formEl) return;

  const valid = await formEl.validate();
  if (valid) {
    saveLoading.value = true;
    try {
      if (form.value.id) {
        await modifyRole(form.value.id, form.value);
      } else {
        await createRole(form.value);
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
 * @param name 名称
 */
async function removeRow(id: number, name: string) {
  await ElMessageBox.confirm(
    t("tips.removeWarning", { module: t("page.roles"), data: name }),
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
      await removeRole(id);
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
    exportToCSV(selectedRows, "roles");
  } else {
    exportToCSV(datas.value, "roles");
  }
  exportLoading.value = false;
}

/**
 * 导入
 */
function onUpload(options: UploadRequestOptions) {
  return importRoles(options.file);
}

/**
 * 授权提交
 */
async function onAuthorizeSubmit() {
  if (!form.value.id) return;

  const authorities = authorizeRef.value?.checkedAuthorities();
  if (!authorities) return;

  try {
    await authorize(form.value.id, authorities);

    authorizeVisible.value = false;
    ElMessage.success(t("message.success", { action: t("action.authorize") }));
  } catch (error) {
    ElMessage.error(t("message.error", { action: t("action.authorize") }));
    throw error;
  }
}
</script>

<template>
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
      <ElTableColumn prop="name" :label="$t('label.name')" />
      <ElTableColumn prop="code" :label="$t('label.code')" />
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
          <template v-if="!scope.row.builtIn">
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
              />{{ $t("action.remove") }}
            </ElButton>
          </template>
          <ElButton
            v-if="hasAction($route.name, 'authorize')"
            title="authorize"
            :type="actionTypes['authorize']"
            link
            @click="authorizeRow(scope.row.id)"
          >
            <Icon
              :icon="`material-symbols:${actionIcons['authorize']}-rounded`"
              width="1.25em"
              height="1.25em"
            />
            {{ $t("action.authorize") }}
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
      <ElRow :gutter="20">
        <ElCol>
          <ElFormItem :label="$t('label.code')" prop="code">
            <ElInput
              v-model="form.code"
              :disabled="form.builtIn"
              @input="
                form.code = form.code.toUpperCase().replace(/[^A-Z]/g, '')
              "
              :placeholder="
                $t('placeholder.inputText', { field: $t('label.code') })
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

  <!-- authorize -->
  <ElDialog
    v-model="authorizeVisible"
    :title="$t('action.authorize')"
    :show-close="false"
  >
    <AuthorizeConfig
      ref="authorizeRef"
      :target-id="form.id"
      :selected="authorities"
    />
    <template #footer>
      <ElButton title="cancel" @click="authorizeVisible = false">
        <Icon :icon="actionIcon('cancel')" width="1.25em" height="1.25em" />{{
          $t("action.cancel")
        }}
      </ElButton>
      <ElButton
        title="submit"
        type="primary"
        :loading="saveLoading"
        @click="onAuthorizeSubmit()"
      >
        <Icon :icon="actionIcon('submit')" width="1.25em" height="1.25em" />
        {{ $t("action.submit") }}
      </ElButton>
    </template>
  </ElDialog>
</template>

<style lang="scss" scoped>
.el-check-tag {
  padding: 4px 9px;
}
</style>
