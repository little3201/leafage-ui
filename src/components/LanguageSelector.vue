<template>
  <q-btn
    title="translate"
    :icon="loadIcon(globalIcons['translate'])"
    round
    flat
    dense
  >
    <q-menu :offset="[0, 10]">
      <q-list dense separator>
        <q-item
          clickable
          v-close-popup
          v-for="option in langOptions"
          :key="option.value"
          :active="locale === option.value"
          @click="changeLocale(option.value)"
        >
          <q-item-section>{{ option.label }}</q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>
</template>

<script setup lang="ts">
import { useAppStore } from "@/stores/app";
import { loadIcon } from "@/utils";
import { langOptions } from "@/lang";
import { globalIcons } from "@/constants";
import { useI18n } from "vue-i18n";

const appStore = useAppStore();
const { locale } = useI18n({ useScope: "global" });
// init the language
locale.value = appStore.locale;

function changeLocale(lang: string) {
  locale.value = lang;
  appStore.setLocale(lang);
}
</script>
