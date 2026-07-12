<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { loadIcon } from "@/utils";
import { useUserStore } from "@/stores/user";
import { useAppStore } from "@/stores/app";
import { ref } from "vue";
import { useRouter } from "vue-router";

const appStore = useAppStore();
const userStore = useUserStore();
const { currentRoute } = useRouter();

const items = ref([
  { name: "overview", icon: "overview-outline", router: "" },
  {
    name: "notifications",
    icon: "notification-settings-outline",
    router: "/notifications"
  },
  { name: "sessions", icon: "bigtop-updates", router: "/sessions" },
  { name: "changePassword", icon: "key-outline", router: "/change-password" },
  { name: "activities", icon: "browse-activity-outline", router: "/activities" }
]);
</script>

<template>
  <ElRow class="mb-4">
    <ElCol :span="24">
      <ElCard body-class="flex items-center">
        <ElAvatar
          :size="80"
          :src="`https://cdn.leafage.top/${userStore.username}`"
        />
        <div class="ml-4 flex-1">
          <span class="text-lg my-1">
            {{ userStore.fullName }}
          </span>

          <div class="text-sm text-(--el-text-color-secondary) space-x-2">
            <span>Username: {{ userStore.username }}</span>
            <span>Email: {{ userStore.email }}</span>
          </div>
        </div>

        <div class="inline-flex flex-col items-center">
          <span>{{
            new Intl.DateTimeFormat(appStore.locale, {
              dateStyle: "medium"
            }).format(new Date())
          }}</span>
          <span class="mt-2">{{
            new Intl.DateTimeFormat(appStore.locale, {
              weekday: "long"
            }).format(new Date())
          }}</span>
        </div>
      </ElCard>
    </ElCol>
  </ElRow>

  <ElRow :gutter="16">
    <ElCol :span="5" :xl="4">
      <ElCard>
        <ElMenu router :default-active="currentRoute.fullPath">
          <ElMenuItem
            v-for="item in items"
            :key="item.name"
            :index="`/profile${item.router}`"
          >
            <Icon
              :icon="loadIcon(item.icon)"
              width="20"
              height="20"
              class="mr-2"
            />
            {{ $t(`label.${item.name}`) }}
          </ElMenuItem>
        </ElMenu>
      </ElCard>
    </ElCol>

    <ElCol :span="19" :xl="20">
      <ElCard>
        <RouterView />
      </ElCard>
    </ElCol>
  </ElRow>
</template>
