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
  () => props.sectionId,
  async (newVal, oldVal) => {
    if (newVal === oldVal) return;

    await load();
  }
);

async function load() {
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
</script>

<template>
  <ExcelContent
    v-if="excelMode === 'DATA'"
    :section-id="sectionId"
    :read-only="readOnly"
  />
  <ExcelField
    v-else-if="excelMode === 'FIELD'"
    :section-id="sectionId"
    :read-only="readOnly"
  />
  <ExcelRender
    v-else-if="excelMode === 'RENDER'"
    :section-id="sectionId"
    :name="name"
    :read-only="readOnly"
  />
</template>
