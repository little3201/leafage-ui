<template>
  <q-layout>
    <q-page-container class="overflow-hidden">
      <q-page padding class="text-center flex-center vertical-middle">
        <q-img :src="img404" style="width: 30%; " class="q-mx-auto" />

        <div class="text-h2" style="opacity:.4">
          Oops. Nothing here...
        </div>

        <q-btn type="button" title="go_home" color="primary" class="q-mt-xl" unelevated to="/"
          :label="$t('action.goHome')" no-caps />
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import img404 from 'src/assets/404.svg'
</script>
