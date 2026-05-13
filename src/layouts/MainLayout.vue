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
      <v-list activatable nav slim>
        <v-list-item
          exact
          link
          prepend-icon="mdi-home"
          :title="$t('page.home')"
          to="/"
        />

        <template v-for="link in userStore.privileges" :key="link.id">
          <EssentialList v-if="link.children && link.children.length > 0" :essential-link="link" :parent-path="`/${link.meta.path}`" />

          <v-list-item
            v-else
            link
            :prepend-icon="`mdi-${link.meta.icon}`"
            :title="$t(`page.${link.name}`)"
            :to="link.meta.path"
          />
        </template>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <router-view />
    </v-main>

    <v-footer app>
      <div class="flex-1-0-100 text-center mt-2">
        Copyright &copy; {{ new Date().getFullYear() }} — <strong>Leafage</strong>  All Rights Reserved.
      </div>
    </v-footer>
  </v-layout>
</template>

<script setup lang="ts">
import EssentialList from 'components/EssentialList.vue'
import { useUserStore } from 'stores/user'
import { useLocale, useTheme } from 'vuetify'

const theme = useTheme()
const { current } = useLocale()
const userStore = useUserStore()

function changeLocale (locale: string) {
  current.value = locale
}
</script>
