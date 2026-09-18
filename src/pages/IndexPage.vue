<template>
  <q-page padding>
    <div class="row q-pb-md q-gutter-md">
      <div class="col-8">
        <q-card
          flat
          class="q-mb-md text-white"
          style="background: radial-gradient(circle, #35a2ff 0%, #014a88 100%)"
        >
          <q-card-section class="flex items-center">
            <div class="q-ml-md">
              <p class="text-h3">管理员</p>

              <div class="text-subtitle1">
                <span>欢迎回来</span>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <q-card flat>
          <q-card-section>
            <div class="text-h6">应用中心 </div>
          </q-card-section>

          <q-card-section class="q-pt-none q-gutter-md">
            <q-btn title="create" size="xl" color="primary" label="文档中心" />
            <q-btn
              title="create"
              size="xl"
              color="primary"
              label="开发工具"
            /><q-btn title="create" size="xl" color="primary" label="主数据" />
          </q-card-section>
        </q-card>
      </div>
      <div class="col">
        <q-card flat>
          <q-card-section>
            <div class="text-h6">待办事项</div>
          </q-card-section>

          <q-card-section>
            <q-date v-model="date" today-btn :locale="{ ...locale.date }" />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="row q-gutter-md">
      <div class="col-8">
        <q-card flat>
          <q-card-section>
            <chart-view :options="lineOptionsData" />
          </q-card-section>
        </q-card>
      </div>

      <div class="col">
        <q-card flat>
          <q-card-section>
            <div class="text-h6">通知公告</div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useQuasar } from "quasar";
import ChartView from "@/components/ChartView.vue";
import { lineOptions } from "@/mocks/charts-data";
import type { ApexOptions } from "apexcharts";
import { ref, reactive } from "vue";

const $q = useQuasar();
const locale = $q.lang;

const lineOptionsData = reactive<ApexOptions | object>(lineOptions);
const date = ref<string>("2026/09/10");
</script>
