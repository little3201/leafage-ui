<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { globalIcons } from "@/constants";
import type { User } from "@/types";
import { actionIcon, loadIcon } from "@/utils";
import { useUserStore } from "@/stores/user";
import { reactive, ref } from "vue";

const userStore = useUserStore();

const initialValues: User = {
  id: null,
  username: userStore.username,
  fullName: userStore.fullName,
  email: userStore.email
};
const form = ref<User>({ ...initialValues });

const state = reactive({
  email: false,
  fullName: false
});

const items = [
  { name: "Github", link: null },
  { name: "Gitee", link: "example@example.com" }
];
</script>

<template>
  <h3>{{ $t("label.overview") }}</h3>
  <div class="flex flex-row">
    <div class="relative group mx-6">
      <ElAvatar :size="192" :src="`https://cdn.leafage.top/${form.username}`" />
      <div
        class="absolute inset-0 h-48 flex items-center justify-center gap-4 rounded-full bg-(--el-overlay-color-lighter) opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      >
        <ElUpload :limit="1" class="h-8">
          <ElButton title="upload" type="primary" circle>
            <Icon :icon="actionIcon('upload')" width="1.25em" height="1.25em" />
          </ElButton>
        </ElUpload>
        <ElButton title="remove" circle>
          <Icon :icon="actionIcon('remove')" width="1.25em" height="1.25em" />
        </ElButton>
      </div>
    </div>

    <div class="inline-flex flex-col ml-8 mt-1">
      <ElForm label-width="auto">
        <ElRow>
          <ElCol :span="20">
            <ElFormItem :label="$t('label.username')" prop="username">
              <ElInput
                v-model="form.username"
                :placeholder="
                  $t('placeholder.inputText', { field: $t('label.username') })
                "
                :maxLength="50"
                disabled
              />
              <p class="mb-0 mt-1 text-xs text-gray-500"
                >Your name may appear around GitHub where you contribute or are
                mentioned.
              </p>
            </ElFormItem>
          </ElCol>
        </ElRow>
        <ElRow>
          <ElCol :span="20">
            <ElFormItem :label="$t('label.fullName')" prop="fullName">
              <ElInput
                v-model="form.fullName"
                :placeholder="
                  $t('placeholder.inputText', { field: $t('label.fullName') })
                "
                :maxLength="50"
                :disabled="!state.fullName"
              />
              <p class="mb-0 mt-1 text-xs text-gray-500"
                >Get important notifications about you or activity you've
                missed.
              </p>
            </ElFormItem>
          </ElCol>
          <ElCol :span="4">
            <ElButton
              link
              type="primary"
              class="mt-2 ml-4"
              @click="state.fullName = !state.fullName"
            >
              {{
                state.fullName ? $t("action.save") : $t("action.modify")
              }}</ElButton
            >
            <ElButton
              v-if="state.fullName"
              link
              type="default"
              class="mt-2 ml-4"
              @click="state.fullName = !state.fullName"
            >
              {{ $t("action.cancel") }}
            </ElButton>
          </ElCol>
        </ElRow>
        <ElRow>
          <ElCol :span="20">
            <ElFormItem :label="$t('label.email')" prop="email">
              <ElInput
                type="email"
                v-model="form.email"
                :placeholder="
                  $t('placeholder.inputText', { field: $t('label.email') })
                "
                :maxLength="50"
                :disabled="!state.email"
              />
              <p class="mb-0 mt-1 text-xs text-gray-500"
                >Get important notifications about you or activity you've
                missed.
              </p>
            </ElFormItem>
          </ElCol>
          <ElCol :span="4">
            <ElButton
              link
              type="primary"
              class="mt-2 ml-4"
              @click="state.email = !state.email"
            >
              {{ state.email ? $t("action.save") : $t("action.modify") }}
            </ElButton>
            <ElButton
              v-if="state.email"
              link
              type="default"
              class="mt-2 ml-4"
              @click="state.email = !state.email"
            >
              {{ $t("action.cancel") }}
            </ElButton>
          </ElCol>
        </ElRow>
      </ElForm>
    </div>
  </div>

  <div class="mt-8">
    <h3>Third accouts authorize</h3>
    <ul class="mt-4 pl-0">
      <li
        v-for="item in items"
        :key="item.name"
        class="flex justify-between p-4 hover:bg-neutral-200 rounded-md"
      >
        <div>
          <div class="flex items-center">
            <span class="font-bold text-xl">{{ item.name }}</span>
            <template v-if="item.link">
              <Icon
                :icon="loadIcon(globalIcons['link'])"
                width="1.25em"
                height="1.25em"
                class="mx-3"
              />
              <ElLink
                type="primary"
                href="https://www.gitee.com/"
                target="_blank"
                >{{ item.link }}</ElLink
              >
            </template>
          </div>
          <p class="mb-0 mt-1 text-xs text-(--el-text-color-secondary)">
            {{
              item.link
                ? "Last used within the last 2 years."
                : "No account relation."
            }}
          </p>
        </div>
        <ElButton link :type="item.link ? 'danger' : 'primary'">{{
          item.link ? "解绑" : "绑定"
        }}</ElButton>
      </li>
    </ul>
  </div>
</template>
