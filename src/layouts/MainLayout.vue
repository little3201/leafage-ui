<template>
  <q-layout view="hHh LpR lff" :class="$q.dark.isActive ? '' : 'bg-grey-2'">
    <q-header>
      <q-toolbar>
        <q-img alt="logo" src="/logo.svg" width="2em" height="2em" />
        <q-toolbar-title :shrink="true">{{ appTitle }}</q-toolbar-title>
        <q-toolbar-title>
          <q-btn
            title="drawer"
            type="button"
            dense
            flat
            round
            icon="sym_r_menu"
            @click="miniState = !miniState"
            class="cursor-pointer"
          />
        </q-toolbar-title>
        <div class="q-mx-md">
          <ThemeToogle />
          <LanguageSelector class="q-mx-sm" />
        </div>
        <div class="cursor-pointer">
          <div flat rounded>
            <q-avatar size="md">
              <img
                :src="`https://cdn.leafage.top/${userStore.username}`"
                alt="avatar"
              />
            </q-avatar>
            <span class="q-ml-sm">{{ userStore.username }}</span>
          </div>
          <q-menu :offset="[0, 10]">
            <q-list separator>
              <q-item to="/profile">
                <q-item-section side>
                  <q-icon :name="loadIcon(globalIcons['profile'])" />
                </q-item-section>
                <q-item-section>{{ $t("page.profile") }}</q-item-section>
              </q-item>
              <q-item to="/faq">
                <q-item-section side>
                  <q-icon :name="loadIcon(globalIcons['help'])" />
                </q-item-section>
                <q-item-section>{{ $t("page.faq") }}</q-item-section>
              </q-item>
              <q-item
                clickable
                v-close-popup
                @click="signOut(userStore.idToken)"
              >
                <q-item-section side>
                  <q-icon :name="loadIcon(globalIcons['logout'])" />
                </q-item-section>
                <q-item-section>{{ $t("action.signout") }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer show-if-above :mini="miniState" side="left" :width="240">
      <q-list>
        <q-item exact to="/">
          <q-item-section side>
            <q-icon :name="pageIcon('home')" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ $t("page.home") }}</q-item-label>
          </q-item-section>
        </q-item>

        <template v-for="link in userStore.privileges" :key="link.id">
          <EssentialList
            v-if="link.children && link.children.length > 0"
            :essentialLink="link"
            :parent-path="`/${link.meta.path}`"
          />

          <q-item exact v-else :to="`/${link.meta.path}`">
            <q-item-section side>
              <q-icon :name="pageIcon(link.name)" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ $t(`page.${link.name}`) }}</q-item-label>
            </q-item-section>
          </q-item>
        </template>
      </q-list>
    </q-drawer>

    <q-page-container class="overflow-hidden">
      <router-view />
    </q-page-container>

    <q-footer class="bg-transparent">
      <q-toolbar>
        <q-toolbar-title
          class="text-center text-body2"
          :class="$q.dark.isActive ? '' : 'text-black'"
        >
          Copyright &copy; {{ new Date().getFullYear() }} All Rights Reserved.
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { globalIcons } from "@/constants";
import { ref } from "vue";
import { loadIcon, pageIcon } from "@/utils";
import { signOut } from "@/api/authentication";
import EssentialList from "@/components/EssentialList.vue";
import LanguageSelector from "@/components/LanguageSelector.vue";
import ThemeToogle from "@/components/ThemeToogle.vue";

const userStore = useUserStore();

const appTitle = import.meta.env.APP_TITLE;
const miniState = ref<boolean>(false);

function onDrawerClick() {
  miniState.value = !miniState.value;
}
</script>
