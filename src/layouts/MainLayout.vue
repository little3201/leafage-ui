<template>
  <v-layout>
    <v-app-bar flat title="Application bar">
      <template #append>
        <v-btn
          :icon="theme.current.value.dark ? 'mdi-weather-sunny' : 'mdi-weather-night'"
          @click="theme.toggle()"
        />

        <v-menu>
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              icon="mdi-translate"
            />
          </template>

          <v-list nav>
            <v-list-item
              link
              title="English"
              @click="changeLocale('en')"
            />

            <v-list-item
              link
              title="简体中文"
              @click="changeLocale('zhHans')"
            />

            <v-list-item
              link
              title="繁體中文"
              @click="changeLocale('zhHant')"
            />
          </v-list>
        </v-menu>
      </template>
    </v-app-bar>

    <v-navigation-drawer>
      <v-list nav>
        <v-list-item link title="Users" to="/system/users" />
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
import { useLocale, useTheme } from 'vuetify'

const theme = useTheme()
const { current } = useLocale()

function changeLocale (locale: string) {
  current.value = locale
}
</script>
