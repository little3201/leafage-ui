<template>
  <div ref="elRef" :style="styles"></div>
</template>

<script setup lang="ts">
import type { ApexOptions, ApexLocale } from "apexcharts";
import ApexCharts from "apexcharts";
import { debounce, is } from "quasar";
import { useAppStore } from "@/stores/app";
import en from "apexcharts/dist/locales/en.json";
import zhCN from "apexcharts/dist/locales/zh-cn.json";
import zhTW from "apexcharts/dist/locales/zh-tw.json";
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
const { theme, locale } = storeToRefs(appStore);

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

const chartLocales: Record<string, ApexLocale> = {
  "en-US": en,
  "zh-CN": zhCN,
  "zh-TW": zhTW
};

const styles = computed(() => {
  const width = is.number(props.width) ? `${props.width}px` : props.width;
  const height = is.number(props.height) ? `${props.height}px` : props.height;

  return {
    width,
    height
  };
});

const lang = computed(() => {
  return chartLocales[locale.value]?.name ?? "en-US";
});

const options = computed(
  () =>
    ({
      ...props.options,
      theme: {
        ...props.options.theme,
        mode: theme.value === "dark" ? "dark" : "light"
      },
      chart: {
        ...props.options.chart,
        locales: [en, zhCN, zhTW],
        defaultLocale: lang.value
      }
    }) satisfies ApexOptions
);

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
        mode: newVal === "dark" ? "dark" : "light"
      }
    });
  }
});

watch(locale, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    const newLang = chartLocales[newVal]?.name ?? "en-US";
    chart?.setLocale?.(newLang);
    chart?.updateOptions?.({
      chart: { defaultLocale: newLang }
    });
  }
});

const resizeHandler = debounce(async () => {
  if (chart) {
    await chart.updateOptions(options.value, true, false);
  }
}, 100);

const contentResizeHandler = (e: TransitionEvent): void => {
  if (e.propertyName === "width") {
    resizeHandler();
  }
};

onMounted(async () => {
  await initChart();

  window.addEventListener("resize", resizeHandler);
  if (elRef.value) {
    elRef.value.addEventListener(
      "transitionend",
      contentResizeHandler as (event: Event) => void
    );
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", resizeHandler);
  if (elRef.value) {
    (elRef.value as Element).removeEventListener(
      "transitionend",
      contentResizeHandler as (event: Event) => void
    );
  }

  if (chart) {
    chart.destroy();
  }
});

onActivated(() => {
  if (chart) {
    resizeHandler();
  }
});
</script>
