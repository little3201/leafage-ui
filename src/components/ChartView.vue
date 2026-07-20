<script setup lang="ts">
import { useEventListener } from "@vueuse/core";
import type { ApexOptions } from "apexcharts";
import en from "apexcharts/dist/locales/en.json";
import zhCN from "apexcharts/dist/locales/zh-cn.json";
import zhTW from "apexcharts/dist/locales/zh-tw.json";
import ApexCharts from "apexcharts";
import { isNumber } from "@/utils";
import { useAppStore } from "@/stores/app";
import { storeToRefs } from "pinia";
import {
  computed,
  onActivated,
  onBeforeUnmount,
  onMounted,
  ref,
  watch
} from "vue";

const appStore = useAppStore();
const props = withDefaults(
  defineProps<{
    options: ApexOptions;
    width?: number | string;
    height?: number | string;
  }>(),
  {
    width: "100%",
    height: "400px"
  }
);

const elRef = ref<HTMLElement | null>(null);
let chart: ApexCharts;

const { theme, locale } = storeToRefs(appStore);
const isDark = ref<boolean>(
  window.matchMedia("(prefers-color-scheme: dark)").matches
);

const chartLocales: Record<string, typeof en> = {
  "en-US": en,
  "zh-CN": zhCN,
  "zh-TW": zhTW
};
const lang = computed(() => {
  return chartLocales[locale.value].name;
});

const mode = computed(() => {
  return theme.value === "auto"
    ? isDark.value
      ? "dark"
      : "light"
    : (theme.value as "dark" | "light");
});

const options = computed(
  () =>
    ({
      ...props.options,
      theme: {
        ...props.options.theme,
        mode: mode.value
      },
      chart: {
        ...props.options.chart,
        locales: [en, zhCN, zhTW],
        defaultLocale: lang.value
      }
    }) satisfies ApexOptions
);

const styles = computed(() => {
  const width = isNumber(props.width) ? `${props.width}px` : props.width;
  const height = isNumber(props.height) ? `${props.height}px` : props.height;

  return {
    width,
    height
  };
});

const initChart = async () => {
  if (!elRef.value) return;

  if (options.value) {
    if (chart) {
      chart.destroy();
    }
    chart = new ApexCharts(elRef.value, options.value);
    await chart?.render();
  }
};

watch(theme, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    chart?.updateOptions({
      theme: {
        mode: mode.value
      }
    });
  }
});

watch(locale, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    const lang = chartLocales[newVal].name;
    chart?.setLocale(lang);
    chart?.updateOptions({
      chart: { defaultLocale: lang }
    });
  }
});

const resizeHandler = () => {
  chart?.updateOptions({
    chart: {
      width: styles.value.width,
      height: styles.value.height
    }
  });
};

useEventListener(document, "transitionend", evt => {
  if (elRef.value && evt.propertyName === "width") {
    resizeHandler();
  }
});

onMounted(async () => {
  await initChart();
});

onBeforeUnmount(() => {
  if (chart) {
    chart.destroy();
  }
});

onActivated(() => {
  if (chart) {
    void resizeHandler();
  }
});
</script>

<template>
  <div ref="elRef" :style="styles"></div>
</template>
