<template>
  <q-page padding>
    <div class="row q-mb-md">
      <div class="col">
        <q-card flat>
          <q-card-section class="flex items-center">
            <q-avatar size="80px">
              <img :src="`https://cdn.leafage.top/${me.username}`" alt="avatar" />
            </q-avatar>

            <div class="q-ml-md">
              <span class="text-subtitle2">
                {{ me.fullName }}
              </span>

              <div class="text-caption">
                <span>{{ me.username }}</span>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <div style="width: 256px;">
        <q-card flat>
          <q-card-section>
            <q-list>
              <q-item exact clickable v-ripple v-for="item in items" :key="item.name" :to="`/profile/${item.router}`">
                <q-item-section avatar>
                  <q-icon :name="`sym_r_${item.icon}`" />
                </q-item-section>
                <q-item-section>{{ $t(`label.${item.name}`) }}</q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <div class="col">
        <q-card flat>
          <q-card-section>
            <router-view />
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useUserStore } from 'src/stores/user-store'
import { ref } from 'vue'


const userStore = useUserStore()

const me = {
  username: userStore.username,
  fullName: userStore.fullName
}

const items = ref([
  { name: 'overview', icon: 'overview', router: '' },
  { name: 'notifications', icon: 'notifications', router: 'notifications' },
  { name: 'sessions', icon: 'bigtop_updates', router: 'sessions' },
  { name: 'changePassword', icon: 'key', router: 'change-password' },
  { name: 'activities', icon: 'browse_activity', router: 'activities' },
])
</script>