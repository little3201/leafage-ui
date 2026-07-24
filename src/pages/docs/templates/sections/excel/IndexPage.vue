<script setup lang="ts">
import {
  retrieveSectionDatas,
  retrieveSectionFields
} from "@/api/docs/sections";
import type { SectionData, SectionField } from "@/types";
import { onMounted, ref, watch } from "vue";
import ExcelContent from "./ExcelContent.vue";
import ExcelField from "./ExcelField.vue";
import ExcelRender from "./ExcelRender.vue";

const props = defineProps<{
  name: string;
  sectionId: number;
  readOnly?: boolean;
  excelMode?: "DATA" | "FIELD" | "RENDER";
}>();

const sectionFields = ref<Array<SectionField>>([]);
const sectionDatas = ref<Array<SectionData>>([]);

onMounted(async () => {
  await load();
});

watch(
  [() => props.sectionId, () => props.excelMode],
  async ([newSectionId, newExcelMode], [oldSectionId, oldExcelMode]) => {
    if (newSectionId === oldSectionId && newExcelMode === oldExcelMode) return;

    await load();
  }
);

async function load() {
  if (props.excelMode === "FIELD") {
    await loadFields();
  } else {
    await loadFieldsAndDatas();
  }
}

async function loadFieldsAndDatas() {
  if (!props.sectionId) return;

  try {
    const [fieldRes, dataRes] = await Promise.all([
      retrieveSectionFields(props.sectionId),
      retrieveSectionDatas(props.sectionId)
    ]);
    sectionFields.value = fieldRes.data;
    sectionDatas.value = dataRes.data;
  } catch (error) {
    sectionFields.value = [];
    sectionDatas.value = [];

    throw error;
  }
}

async function loadFields() {
  if (!props.sectionId) return;

  try {
    const res = await retrieveSectionFields(props.sectionId);
    sectionFields.value = res.data;
  } catch (error) {
    sectionFields.value = [];

    throw error;
  }
}
</script>

<template>
  <ExcelContent
    v-if="excelMode === 'DATA'"
    :section-id="sectionId"
    :section-fields="sectionFields"
    :section-datas="sectionDatas"
    :read-only="readOnly"
  />
  <ExcelField
    v-else-if="excelMode === 'FIELD'"
    :section-id="sectionId"
    :section-fields="sectionFields"
    :read-only="readOnly"
  />
  <ExcelRender
    v-else-if="excelMode === 'RENDER'"
    :name="name"
    :section-fields="sectionFields"
    :section-datas="sectionDatas"
    :read-only="readOnly"
  />
</template>
