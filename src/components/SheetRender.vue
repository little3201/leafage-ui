<script setup lang="ts">
import dhx from "@dhtmlx/spreadsheet";
import type { IDataWithStyles, ICellInfo } from "@dhtmlx/spreadsheet";
import { useAppStore } from "@/stores/app";
import { storeToRefs } from "pinia";
import { onMounted, onUnmounted, ref, watch } from "vue";

import "@dhtmlx/spreadsheet/codebase/spreadsheet.min.css";

const appStore = useAppStore();
const props = defineProps<{
  data: IDataWithStyles | ICellInfo[];
  readOnly?: boolean;
}>();

const { theme, locale } = storeToRefs(appStore);
const container = ref<HTMLElement | null>(null);
const spreadsheet = ref<dhx.Spreadsheet | null>(null);

watch(theme, (newVal, oldVal) => {
  if (!container.value) return;

  if (newVal !== oldVal) {
    dhx.setTheme(theme.value, container.value);
  }
});

watch(locale, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    dhx.i18n.setLocale(container.value, locale.value);
  }
});

watch(
  () => props.data,
  (newVal, oldVal) => {
    if (!spreadsheet.value || !newVal) return;
    //避免深度监听造成的死循环
    if (JSON.stringify(newVal) === JSON.stringify(oldVal)) return;

    spreadsheet.value.parse(props.data);
  },
  { deep: true }
);

onMounted(() => {
  if (container.value && props.data) {
    dhx.i18n.setLocale(container.value, locale.value);
    spreadsheet.value = new dhx.Spreadsheet(container.value, {
      menu: true
    });
    dhx.setTheme(theme.value, container.value);
    spreadsheet.value.parse(props.data);
  }
});

onUnmounted(() => {
  spreadsheet.value?.destructor();
});
</script>

<template>
  <div ref="container" style="height: 600px" />
</template>
