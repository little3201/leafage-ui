<template>
  <q-btn
    flat
    round
    dense
    :icon="loadIcon(globalIcons[$q.dark.isActive ? 'dark' : 'light'])"
    @click="handleChange(!$q.dark.isActive)"
  />
</template>

<script setup lang="ts">
import { useQuasar } from "quasar";
import { useAppStore } from "@/stores/app";
import { loadIcon } from "@/utils";
import { globalIcons } from "@/constants";

const $q = useQuasar();
const appStore = useAppStore();
$q.dark.set(appStore.theme === "dark");

function handleChange(dark: boolean) {
  appStore.setTheme(dark ? "dark" : "light");
  $q.dark.set(dark);
}
</script>
