<script setup lang="ts">
import SheetRender from "@/components/SheetRender.vue";
import {
  retrieveSectionDatas,
  retrieveSectionFields
} from "@/api/docs/sections";
import type { SectionData, SectionField } from "@/types";
import { transformToWorkbookData } from "@/utils";
import { computed, onMounted, ref, watch } from "vue";

const props = defineProps<{
  name: string;
  sectionId: number;
  readOnly?: boolean;
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

const data = computed(() =>
  transformToWorkbookData(sectionFields.value, sectionDatas.value)
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
  <SheetRender :data="{ ...data, name: name }" :read-only="readOnly" />
</template>
