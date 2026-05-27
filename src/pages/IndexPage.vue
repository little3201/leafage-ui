<script setup lang="ts">
import AppFooter from 'components/AppFooter.vue'
import AppTopbar from 'components/AppTopbar.vue'
import ProductOverviewWidget from 'components/dashboard/ProductOverviewWidget.vue'
import RecentActivityWidget from 'components/dashboard/RecentActivityWidget.vue'
import SalesTrendWidget from 'components/dashboard/SalesTrendWidget.vue'
import StatsWidget from 'components/dashboard/StatsWidget.vue'
</script>

<template>
  <div class="bg-surface-50 dark:bg-surface-950 min-h-screen flex flex-col">
    <AppTopbar />
    <div class="flex flex-col w-full p-6 gap-6 flex-1">
      <StatsWidget />
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SalesTrendWidget />
        <RecentActivityWidget />
      </div>
      <ProductOverviewWidget />
    </div>
    <AppFooter />
  </div>
</template>
