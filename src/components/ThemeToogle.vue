<template>
  <q-btn
    flat
    round
    dense
    :icon="$q.dark.isActive ? 'sym_r_dark_mode' : 'sym_r_light_mode'"
    @click="handleChange(!$q.dark.isActive)"
  />
</template>

<script setup lang="ts">
import { useQuasar } from "quasar";
import { useAppStore } from "@/stores/app";

const $q = useQuasar();
const appStore = useAppStore();
$q.dark.set(appStore.theme === "dark");

function handleChange(dark: boolean) {
  appStore.setTheme(dark ? "dark" : "light");
  $q.dark.set(dark);
}
</script>
