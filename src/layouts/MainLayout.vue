<template>
  <v-layout>
    <v-app-bar flat title="Application bar">
      <template #append>
        <v-btn
          :icon="theme.current.value.dark ? 'mdi-weather-sunny' : 'mdi-weather-night'"
          @click="theme.toggle()"
        />
      </template>
    </v-app-bar>

    <v-navigation-drawer>
      <v-list nav>
        <v-list-item link title="Navigation drawer" />
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <router-view />
    </v-main>

    <v-footer app>
      <div class="flex-1-0-100 text-center mt-2">
        {{ new Date().getFullYear() }} — <strong>Vuetify</strong>
      </div>
    </v-footer>
  </v-layout>
</template>

<script setup lang="ts">
import { useTheme } from 'vuetify'

const theme = useTheme()
</script>
