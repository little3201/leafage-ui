<template>
  <v-app-bar color="primary" density="comfortable" flat title="Application bar">
    <template #append>
      <div class="d-inline-flex ga-2 mr-4">
        <ThemeToogle />
        <LanguageSelector />
      </div>

      <v-menu>
        <template #activator="{ props }">
          <v-sheet color="transparent" v-bind="props">
            <v-avatar>
              <v-img
                alt="avatar"
                :src="`https://cdn.leafage.top/${userStore.username}`"
              />
            </v-avatar>

            <span class="ml-2">{{ userStore.username }}</span>
          </v-sheet>
        </template>

        <v-list density="compact">
          <v-list-item
            :prepend-icon="loadIcon(globalIcons['logout'])"
            @click="signOut()"
          >
            <v-list-item-title>{{ $t("action.signout") }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </template>
  </v-app-bar>

  <v-navigation-drawer>
    <v-list
      activatable
      density="comfortable"
      nav
      slim
    >
      <v-list-item
        exact
        link
        :prepend-icon="pageIcon('home')"
        rounded="pill"
        :title="$t('page.home')"
        to="/"
      />

      <template v-for="link in userStore.privileges" :key="link.id">
        <EssentialList v-if="link.children && link.children.length > 0" :essential-link="link" :parent-path="`/${link.meta.path}`" />

        <v-list-item
          v-else
          link
          :prepend-icon="pageIcon(link.name)"
          rounded="pill"
          :title="$t(`page.${link.name}`)"
          :to="link.meta.path"
        />
      </template>
    </v-list>
  </v-navigation-drawer>

  <v-main>
    <v-sheet color="surface-light dark:surface-variant" height="100%">
      <v-container fluid>
        <router-view />
      </v-container>
    </v-sheet>
  </v-main>

  <v-footer app color="surface-light dark:surface-variant">
    <div class="flex-1-0-100 text-center mt-2">
      Copyright &copy; {{ new Date().getFullYear() }} — <strong>Leafage</strong>  All Rights Reserved.
    </div>
  </v-footer>
</template>

<script setup lang="ts">
import { signOut } from '@/api/authentication'
import EssentialList from '@/components/EssentialList.vue'
import LanguageSelector from '@/components/LanguageSelector.vue'
import ThemeToogle from '@/components/ThemeToogle.vue'
import { globalIcons } from '@/constants'
import { useUserStore } from '@/stores/user'
import { loadIcon, pageIcon } from '@/utils'

const userStore = useUserStore()
</script>
