<template>
  <q-layout view="hHh LpR lff" :class="$q.dark.isActive ? '' : 'bg-grey-2'">
    <q-header>
      <q-toolbar>
        <q-img alt="logo" :src="logo" width="2em" height="2em" />
        <q-toolbar-title :shrink="true">
          Project Management
        </q-toolbar-title>
        <q-toolbar-title>
          <q-btn title="drawer" type="button" dense flat round icon="sym_r_menu"
            @click="leftDrawerOpen = !leftDrawerOpen" class="cursor-pointer" />
        </q-toolbar-title>
        <div class="q-mx-md">
          <!-- theme -->
          <ThemeToogle />
          <!-- language -->
          <LanguageSelector class="q-mx-sm" />
          <!-- faq -->
          <q-btn flat round dense title="faq" icon="sym_r_help" to="/faq" />
        </div>
        <div class="cursor-pointer">
          <q-avatar size="md">
            <img :src="userStore.avatar" alt="avatar" />
          </q-avatar>
          <span class="q-ml-sm">{{ userStore.username }}</span>
          <q-menu>
            <q-list separator>
              <q-item to="/profile">
                <q-item-section avatar>
                  <q-icon name="sym_r_manage_accounts" />
                </q-item-section>
                <q-item-section>{{ $t('profile') }}</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="signOut(userStore.idToken)">
                <q-item-section avatar>
                  <q-icon name="sym_r_logout" />
                </q-item-section>
                <q-item-section>{{ $t('signout') }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </div>

      </q-toolbar>
    </q-header>

    <q-drawer show-if-above v-model="leftDrawerOpen" side="left" bordered :width="220">
      <q-list>
        <!-- home -->
        <EssentialLink v-bind="{
          name: 'home',
          icon: 'home',
          path: '/'
        }" />
        <!-- privileges -->
        <template v-for="link in userStore.privileges" :key="link.id">
          <EssentialList v-if="link.children && link.children.length > 0" :essentialLink="link"
            :parent-path="`/${link.meta.path}`" />
          <EssentialLink v-else v-bind="{
            name: link.name,
            icon: link.meta.icon,
            path: link.meta.path
          }" />
        </template>
      </q-list>
    </q-drawer>

    <q-page-container class="overflow-hidden">
      <router-view />
    </q-page-container>

    <q-footer class="bg-transparent">
      <q-toolbar>
        <q-toolbar-title class="text-center text-body2" :class="$q.dark.isActive ? '' : 'text-black'">
          &copy; {{ new Date().getFullYear() }} All Rights Reserved.
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { useUserStore } from 'stores/user-store'

import EssentialLink from 'components/EssentialLink.vue'
import EssentialList from 'components/EssentialList.vue'
import LanguageSelector from 'components/LanguageSelector.vue'
import ThemeToogle from 'components/ThemeToogle.vue'
import { signOut } from 'src/api/authentication'
import logo from 'src/assets/logo.svg'


const $q = useQuasar()
const userStore = useUserStore()

const leftDrawerOpen = ref<boolean>(false)
</script>
