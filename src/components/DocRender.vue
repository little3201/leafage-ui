<script lang="ts" setup>
import { Richtext, locales } from "@dhtmlx/richtext";
import { useAppStore } from "@/stores/app";
import { storeToRefs } from "pinia";
import { onBeforeUnmount, onMounted, ref, watch } from "vue";

import "@dhtmlx/richtext/dist/richtext.css";

const appStore = useAppStore();
const props = defineProps<{
  data: string;
  readOnly?: boolean;
}>();

const { locale } = storeToRefs(appStore);
const container = ref<HTMLElement | null>(null);
const editor = ref();

watch(locale, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    editor.value.setLocale(locales.cn);
  }
});

watch(
  () => props.data,
  (newVal, oldVal) => {
    if (!container.value || !newVal) return;
    //避免深度监听造成的死循环
    if (JSON.stringify(newVal) === JSON.stringify(oldVal)) return;

    editor.value.setValue(newVal);
  },
  { deep: true }
);

onMounted(() => {
  if (container.value && props.data) {
    editor.value = new Richtext(container.value, {
      menubar: true,
      layoutMode: "document"
    });
  }
});

onBeforeUnmount(() => {
  editor.value.destructor();
});
</script>

<template>
  <div ref="container" class="h-125" />
</template>
