<script lang="ts" setup>
import { DocxEditor, useDocxSource } from "@docx-editor.dev/vue";
import type { DocxEditorRef } from "@docx-editor.dev/vue";
import { en, zhCN } from "@docx-editor.dev/i18n";
import type { PartialLocaleStrings } from "@docx-editor.dev/i18n";
import { useAppStore } from "@/stores/app";
import { storeToRefs } from "pinia";
import { ref, computed } from "vue";

import "@docx-editor.dev/vue/styles.css";

const props = defineProps<{
  path: string;
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
const { document } = useDocxSource(() => props.path);

const title = computed(() => props.path);
const mode = computed(() => (props.readOnly ? "view" : "edit"));
</script>

<template>
  <DocxEditor
    ref="editorRef"
    :document="document ? document : 'blank'"
    :title="title"
    :mode="mode"
    :i18n="locales[locale || 'zh-CN']"
    :color-mode="theme === 'dark' ? 'dark' : 'light'"
  />
</template>
