<script setup lang="ts">
import SheetRender from "@/components/SheetRender.vue";
import type { SectionData, SectionField } from "@/types";
import { transformToWorkbookData } from "@/utils";
import { computed } from "vue";

const props = defineProps<{
  name: string;
  sectionFields: SectionField[];
  sectionDatas: SectionData[];
  readOnly?: boolean;
}>();

const data = computed(() =>
  transformToWorkbookData(props.sectionFields, props.sectionDatas)
);
</script>

<template>
  <SheetRender :data="{ ...data, name: name }" :read-only="readOnly" />
</template>
