<script setup lang="ts">
import { Icon } from "@iconify/vue";
import type { FormInstance } from "element-plus";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  createSectionData,
  modifySectionData,
  removeSectionData
} from "@/api/docs/sections";
import type { SectionData, SectionField } from "@/types";
import { actionIcon } from "@/utils";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const props = defineProps<{
  sectionId: number | null;
  sectionFields: SectionField[];
  sectionDatas: SectionData[];
  readOnly: boolean;
}>();

const formRef = ref<FormInstance>();
const fields = computed<Array<SectionField>>(() =>
  props.sectionFields.filter(field => field.field !== "id")
);
const datas = computed<Array<SectionData>>(() => props.sectionDatas);
const saveLoading = ref<boolean>(false);
const editable = ref<Record<number, boolean>>({});

function addRow() {
  if (!props.sectionId) return;

  const data: Record<string, string | number | boolean> = {};
  fields.value.forEach(field => {
    if (field.type === "number") {
      data[field.field] = 0;
    } else {
      data[field.field] = "";
    }
  });
  datas.value.push({ id: null, sectionId: props.sectionId, data });
}

function modifyRow(id: number) {
  editable.value[id] = true;
}

async function removeRow(id: number) {
  await ElMessageBox.confirm(
    t("tips.removeWarning", { module: t("action.data"), data: id }),
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
      await removeSectionData(id);

      ElMessage.success(t("message.success", { action: t("action.remove") }));
    } catch (error) {
      ElMessage.error(t("message.error", { action: t("action.remove") }));
      throw error;
    }
  });
}

async function onSubmit(row: SectionData) {
  if (!props.sectionId) return;
  const valid = formRef.value?.validate();
  if (valid) {
    saveLoading.value = true;
    try {
      row.sectionId = props.sectionId;
      if (row.id) {
        await modifySectionData(row.id, row);
        editable.value[row.id] = false;
      } else {
        const res = await createSectionData(row);
        editable.value[res.data.id] = false;
      }

      ElMessage.success(
        t("message.success", {
          action: row.id ? t("action.modify") : t("action.create")
        })
      );
    } catch (error) {
      ElMessage.error(
        t("message.error", {
          action: row.id ? t("action.modify") : t("action.create")
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
  <ElForm ref="formRef" :model="{ datas }" :show-message="false">
    <ElTable :data="datas" row-key="id" table-layout="auto">
      <ElTableColumn type="selection" />
      <ElTableColumn type="index" :label="$t('label.serial')" width="55" />
      <ElTableColumn
        v-for="(field, index) in fields"
        :key="index"
        :prop="field.field"
        :label="field.name"
      >
        <template #default="scope">
          <ElFormItem
            v-if="editable[scope.row.id]"
            :prop="`fields.${scope.$index}.${scope.row.data[field.field]}`"
            :rules="[{ required: scope.row.required, trigger: 'blur' }]"
          >
            <ElInput v-model="scope.row.data[field.field]" />
          </ElFormItem>
          <span v-else>{{ scope.row.data[field.field] }}</span>
        </template>
      </ElTableColumn>
      <ElTableColumn v-if="!readOnly" :label="$t('label.actions')">
        <template #default="scope">
          <div class="items-center w-15">
            <ElButton
              title="remove"
              circle
              size="small"
              type="danger"
              plain
              @click="removeRow(scope.row.id)"
            >
              <Icon
                :icon="actionIcon('cancel')"
                width="1.25em"
                height="1.25em"
              />
            </ElButton>
            <ElButton
              v-if="editable[scope.row.id]"
              v-loading="saveLoading"
              title="confirm"
              circle
              size="small"
              type="success"
              plain
              @click="onSubmit(scope.row)"
            >
              <Icon
                :icon="actionIcon('submit')"
                width="1.25em"
                height="1.25em"
              />
            </ElButton>
            <ElButton
              v-else
              title="modify"
              circle
              size="small"
              type="primary"
              plain
              @click="modifyRow(scope.row.id)"
            >
              <Icon
                :icon="actionIcon('modify')"
                width="1.25em"
                height="1.25em"
              />
            </ElButton>
          </div>
        </template>
      </ElTableColumn>
    </ElTable>
  </ElForm>
  <ElButton
    v-if="!readOnly && fields.length > 1"
    class="mt-4"
    type="primary"
    plain
    style="width: 100%"
    @click="addRow"
  >
    {{ $t("action.addItem") }}
  </ElButton>
</template>
