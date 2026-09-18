<script lang="ts" setup>
import { DocxEditor } from "@docx-editor.dev/vue";
import type { DocxEditorRef } from "@docx-editor.dev/vue";
import { en, zhCN } from "@docx-editor.dev/i18n";
import type { PartialLocaleStrings } from "@docx-editor.dev/i18n";
import { useAppStore } from "@/stores/app";
import { storeToRefs } from "pinia";
import { ref, computed } from "vue";

import "@docx-editor.dev/vue/styles.css";

const props = defineProps<{
  title: string;
  data: ArrayBuffer | Uint8Array | "blank";
  readOnly?: boolean;
}>();
const locales: { [key: string]: PartialLocaleStrings } = {
  "zh-CN": zhCN,
  "zh-TW": zhCN,
  "en-US": en
};
const appStore = useAppStore();
const { theme, locale } = storeToRefs(appStore);

const editorRef = ref<DocxEditorRef | null>(null);

const mode = computed<"view" | "edit">(() =>
  props.readOnly ? "view" : "edit"
);
</script>

<template>
  <DocxEditor
    ref="editorRef"
    :document="data"
    :title="title"
    :mode="mode"
    :i18n="locales[locale || 'zh-CN']"
    :color-mode="theme === 'dark' ? 'dark' : 'light'"
  />
</template>
