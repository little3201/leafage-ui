<script setup lang="ts">
import { Icon } from "@iconify/vue";
import type { TableInstance, FormInstance, FormRules } from "element-plus";
import { dayjs, ElMessage, ElMessageBox } from "element-plus";
import {
  createMessage,
  modifyMessage,
  removeMessage,
  retrieveMessages
} from "@/api/messages";
import { actionTypes, messageStatus } from "@/constants";
import type { Filter, Pagination, Message } from "@/types";
import { actionIcon, hasAction } from "@/utils";
import { onMounted, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const visible = ref<boolean>(false);
const loading = ref<boolean>(false);
const datas = ref<Array<Message>>([]);
const total = ref<number>(0);
const saveLoading = ref<boolean>(false);

const tableRef = ref<TableInstance>();
const pagination = reactive<Pagination>({
  page: 1,
  size: 10,
  descending: true
});

const filter = reactive<Filter<Message>>({
  title: { op: "eq", value: undefined }
});

const formRef = ref<FormInstance>();
const initialValues: Message = {
  id: null,
  title: "",
  type: null,
  receiver: null
};
const form = ref<Message>({ ...initialValues });

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

  const res = await retrieveMessages(pagination, filter);
  datas.value = res.data.content;
  total.value = res.data.page.totalElements;

  loading.value = false;
}

/**
 * 新增、编辑弹出框
 * @param id 主键
 */
function saveRow(row?: Message) {
  form.value = row ? { ...row } : { ...initialValues };

  visible.value = true;
}

/**
 * 详情
 * @param row 数据
 */
function showRow(row: Message) {
  form.value = row ? { ...row } : { ...initialValues };

  visible.value = true;
}

/**
 * 删除
 * @param id 主键
 * @param name 名称
 * @param startTime 开始时间
 */
async function removeRow(id: number, name: string, startTime: string) {
  // 弹出确认框
  await ElMessageBox.confirm(
    t("tips.removeWarning", {
      module: t("page.schedulerLogs"),
      data:
        name + " (start: " + dayjs(startTime).format("YYYY-MM-DD HH:mm") + ")"
    }),
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
      await removeMessage(id);
      await load();
      ElMessage.success(t("message.success", { action: t("action.remove") }));
    } catch (error) {
      ElMessage.error(t("message.error", { action: t("action.remove") }));
      throw error;
    }
  });
}

async function onSubmit(formEl: FormInstance) {
  if (!formEl) return;

  const valid = await formEl.validate();
  if (valid) {
    saveLoading.value = true;
    try {
      if (form.value.id) {
        await modifyMessage(form.value.id, form.value);
      } else {
        await createMessage(form.value);
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

      <ElCol :span="12" class="text-right">
        <ElButton
          v-if="hasAction($route.name, 'create')"
          title="create"
          :type="actionTypes['create']"
          plain
          @click="saveRow"
        >
          <Icon :icon="actionIcon('create')" width="1.25em" height="1.25em" />{{
            $t("action.create")
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
      <ElTableColumn type="index" :label="$t('label.no')" width="55" />
      <ElTableColumn prop="title" :label="$t('label.title')">
        <template #default="scope">
          <ElButton
            title="title"
            type="primary"
            link
            @click="showRow(scope.row)"
          >
            {{ scope.row.title }}
          </ElButton>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="type" :label="$t('label.type')">
        <template #default="scope">
          <ElTag>{{ scope.row.type }}</ElTag>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="receiver" :label="$t('label.receiver')">
        <template #default="scope">
          <div
            v-if="scope.row.receiver && scope.row.receiver.length > 0"
            class="flex items-center"
          >
            <ElAvatarGroup
              collapse-avatars
              :max-collapse-avatars="3"
              collapse-avatars-tooltip
            >
              <ElAvatar
                v-for="receiver in scope.row.receiver"
                :key="receiver.id"
                :src="`https://cdn.leafage.top/${receiver.username}`"
              />
            </ElAvatarGroup>
          </div>
          <span v-else>所有人</span>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="body" :label="$t('label.body')" />
      <ElTableColumn
        prop="status"
        :label="$t('label.status')"
        align="center"
        sortable
      >
        <template #default="scope">
          <ElTag :type="messageStatus[scope.row.status]" round>
            {{ scope.row.status }}
          </ElTag>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="publishedAt" :label="$t('label.publishedAt')">
        <template #default="scope">
          {{
            scope.row.publishedAt
              ? dayjs(scope.row.publishedAt).format("YYYY-MM-DD HH:mm")
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
            v-if="hasAction($route.name, 'publish')"
            title="modify"
            :type="actionTypes['publish']"
            link
            @click="saveRow(scope.row)"
          >
            <Icon
              :icon="actionIcon('publish')"
              width="1.25em"
              height="1.25em"
            />{{ $t("action.publish") }}
          </ElButton>
          <ElButton
            v-if="hasAction($route.name, 'remove')"
            title="remove"
            :type="actionTypes['remove']"
            link
            @click="
              removeRow(scope.row.id, scope.row.name, scope.row.startTime)
            "
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

<style lang="scss" scoped>
:deep(.el-tag__content) {
  display: inline-flex;
  align-items: center;
}
</style>
