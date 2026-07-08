<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { langOptions } from "@/lang";
import { globalIcons } from "@/constants";
import { loadIcon } from "@/utils";
import { useI18n } from "vue-i18n";
import { useAppStore } from "@/stores/app";

const appStore = useAppStore();

const { locale } = useI18n({ useScope: "global" });
locale.value = appStore.lang;

function changeLang(lang: string) {
  locale.value = lang;
  appStore.setLocale(lang);
}
</script>

<template>
  <ElDropdown trigger="click" @command="changeLang" placement="bottom-end">
    <ElButton title="language" type="default" link>
      <Icon
        :icon="loadIcon(globalIcons['translate'])"
        class="text-white"
        width="1.5em"
        height="1.5em"
      />
    </ElButton>
    <template #dropdown>
      <ElDropdownMenu>
        <ElDropdownItem
          v-for="item in langOptions"
          :key="item.value"
          :command="item.value"
        >
          {{ item.label }}
        </ElDropdownItem>
      </ElDropdownMenu>
    </template>
  </ElDropdown>
</template>
