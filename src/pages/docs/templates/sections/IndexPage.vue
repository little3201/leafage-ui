<script setup lang="ts">
import { Icon } from "@iconify/vue";
import type { TreeData, TreeInstance, TreeNodeData } from "element-plus";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  createSection,
  fetchSection,
  modifySection,
  removeSection,
  retrieveSectionTree
} from "@/api/docs/sections";
import { actionTypes } from "@/constants";
import type { Section } from "@/types";
import { actionIcon, hasAction } from "@/utils";
import { onMounted, provide, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import Excel from "./excel/IndexPage.vue";
import SectionForm from "./SectionForm.vue";
import Word from "./word/IndexPage.vue";

const { t } = useI18n();
const props = withDefaults(
  defineProps<{
    ownerId: number | null;
    ownerType: "REPORT" | "ARCHIVE" | "TEMPLATE";
    templateType: "WORD" | "EXCEL";
    readOnly?: boolean;
    excelMode?: "DATA" | "FIELD" | "RENDER";
  }>(),
  { readOnly: false, data: false }
);

const treeRef = ref<TreeInstance>();
const treeData = ref<TreeData>([]);
const treeLoading = ref<boolean>(false);
const selectedTreeId = ref<string>("");
const filterText = ref<string>("");

const saveLoading = ref<boolean>(false);
const visible = ref<boolean>(false);

const saveMethod = ref();
provide("saveData", saveMethod);

const sectionFormRef = ref<InstanceType<typeof SectionForm>>();

const initialValues: Section = {
  id: null,
  ownerId: props.ownerId,
  ownerType: props.ownerType,
  name: "",
  superiorId: null,
  body: {}
};
const form = ref<Section>({ ...initialValues });

onMounted(async () => {
  await loadTree();
});

/**
 * 监听tree
 */
watch(
  () => filterText.value,
  (newVal, oldVal) => {
    if (newVal === oldVal) return;
    treeRef.value!.filter(newVal);
  }
);
watch(
  [() => props.ownerId, () => props.ownerType],
  async ([newOwnerId, newOwnerType]) => {
    selectedTreeId.value = "";

    form.value.ownerId = newOwnerId;
    form.value.ownerType = newOwnerType;
    await loadTree();
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
  if (!data.id || selectedTreeId.value === String(data.id)) {
    return;
  }
  selectedTreeId.value = String(data.id);
  await loadOne(data.id);
}

/**
 * 加载tree
 */
async function loadTree() {
  if (!props.ownerId) return;

  treeLoading.value = true;
  try {
    const res = await retrieveSectionTree(props.ownerId, props.ownerType);
    treeData.value = res.data;
  } catch (error) {
    treeData.value = [];
    throw error;
  } finally {
    treeLoading.value = false;
  }
}

/**
 * 弹出框
 * @param row 数据
 */
function saveRow(row?: Section) {
  form.value = row ? { ...row } : { ...initialValues };

  visible.value = true;
}

/**
 * 加载
 * @param id 主键
 */
async function loadOne(id: number) {
  try {
    const res = await fetchSection(id);
    form.value = res.data;
  } catch (error) {
    form.value = { ...initialValues };
    throw error;
  }
}

/**
 * 表单提交
 */
async function onSubmit() {
  const sectionFormEl = sectionFormRef.value?.sectionFormRef;
  if (!sectionFormEl) return;

  const sectionForm = sectionFormRef.value?.sectionForm;
  if (!sectionForm) return;

  const valid = await sectionFormEl.validate();
  if (valid) {
    try {
      const { id } = sectionForm;

      const superiorId = selectedTreeId.value
        ? Number(selectedTreeId.value)
        : null;
      sectionForm.superiorId = superiorId;
      const node = superiorId ? treeRef.value?.getNode(superiorId) : null;
      if (node) {
        sectionForm.level = node.level ?? 0 + 1;
      } else {
        sectionForm.level = 1;
      }

      const res = id
        ? await modifySection(id, sectionForm)
        : await createSection(sectionForm);
      visible.value = false;

      ElMessage.success(
        t("message.success", {
          action: sectionForm.id ? t("action.modify") : t("action.create")
        })
      );

      const nodeData: TreeNodeData = {
        ...res.data,
        meta: { sequence: res.data.sequence }
      };
      if (id) {
        if (node) {
          Object.assign(node.data, nodeData);
        }
      } else {
        if (superiorId && node) {
          treeRef.value?.append(nodeData, node.data);
        } else {
          treeData.value.push(nodeData);
        }
      }
    } catch (error) {
      ElMessage.error(
        t("message.error", {
          action: sectionForm.id ? t("action.modify") : t("action.create")
        })
      );
      throw error;
    }
  }
}

/**
 * 修改章节内容
 */
async function modifySectionContent() {
  if (!form.value.id) return;

  let sectionData = null;
  if (saveMethod.value && props.templateType === "WORD") {
    sectionData = await saveMethod.value();
  }

  if (!sectionData) return;
  form.value.body = JSON.parse(JSON.stringify(sectionData));
  try {
    await modifySection(form.value.id, form.value);

    ElMessage.success(t("message.success", { action: t("action.modify") }));
  } catch (error) {
    ElMessage.error(t("message.error", { action: t("action.modify") }));
    throw error;
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
    t("tips.removeWarning", { module: t("page.sections"), data: name }),
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
      await removeSection(id);
      const node = treeRef.value?.getNode(id);
      if (node) {
        treeRef.value?.remove(node?.data);
      }

      ElMessage.success(t("message.success", { action: t("action.remove") }));
    } catch (error) {
      ElMessage.error(t("message.error", { action: t("action.remove") }));
      throw error;
    }
  });
}

defineExpose({
  modifySectionContent
});
</script>

<template>
  <ElRow :gutter="16">
    <ElCol :span="8" :xl="6">
      <ElCard>
        <div class="flex items-center space-x-4 mb-4">
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
          <ElButton
            v-if="!readOnly && hasAction($route.name, 'create')"
            title="create"
            circle
            plain
            size="small"
            :type="actionTypes['create']"
            @click="saveRow()"
          >
            <Icon :icon="actionIcon('create')" width="1.25em" height="1.25em" />
          </ElButton>
        </div>

        <ElTree
          ref="treeRef"
          :data="treeData"
          v-loading="treeLoading"
          node-key="id"
          :current-node-key="selectedTreeId"
          highlight-current
          :filter-node-method="filterNode"
          @current-change="onCurrentChange"
        >
          <template #default="{ data }">
            <div class="flex flex-1 items-center justify-between">
              <span>{{ data.meta!.sequence! }}. {{ data.name }}</span>
              <div v-if="!readOnly">
                <ElButton type="primary" link @click="saveRow(data)">
                  <Icon :icon="actionIcon('modify')" />
                </ElButton>
                <ElButton
                  v-if="hasAction($route.name, 'remove')"
                  title="remove"
                  :type="actionTypes['remove']"
                  link
                  @click="removeRow(data.id, data.name)"
                >
                  <Icon :icon="actionIcon('remove')" />
                </ElButton>
              </div>
            </div>
          </template>
        </ElTree>
      </ElCard>
    </ElCol>

    <ElCol :span="16" :xl="18">
      <ElCard v-if="selectedTreeId">
        <Word
          v-if="props.templateType === 'WORD'"
          :data="form.body"
          :title="form.name"
          :read-only="readOnly"
        />
        <Excel
          v-else
          :section-id="Number(selectedTreeId)"
          :name="form.name"
          :excel-mode="excelMode"
        />
      </ElCard>
      <ElEmpty v-else />
    </ElCol>
  </ElRow>

  <!-- form -->
  <ElDialog
    v-model="visible"
    :title="form.id ? $t('action.modify') : $t('action.create')"
    :show-close="false"
    width="400"
  >
    <SectionForm ref="sectionFormRef" :row="form" />
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
        @click="onSubmit()"
      >
        <Icon :icon="actionIcon('submit')" width="1.25em" height="1.25em" />
        {{ $t("action.submit") }}
      </ElButton>
    </template>
  </ElDialog>
</template>
