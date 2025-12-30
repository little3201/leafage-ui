<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUserStore } from 'stores/user-store'
import { Icon } from '@iconify/vue'
import type { User } from 'src/types'


const { t } = useI18n()
const userStore = useUserStore()

const cdn_url = import.meta.env.VITE_APP_CDN_URL
const initialValues: User = {
  id: undefined,
  username: userStore.username,
  fullName: userStore.fullName,
  email: userStore.email
}
const form = ref<User>({ ...initialValues })

const state = reactive({
  email: false,
  fullName: false
})

</script>

<template>
  <h3>{{ t('label.overview') }}</h3>
  <div class="flex flex-row">
    <div class="px-6 relative group">
      <ElAvatar :size="192" :src="`${cdn_url}/${form.username}`" />
      <div
        class="absolute inset-0 w-48 h-48 ml-6 hidden group-hover:flex items-center justify-center rounded-full bg-(--el-overlay-color-lighter) group-hover:opacity-100 transition">
        <ElButton title="upload" type="primary" circle>
          <Icon icon="material-symbols:upload-rounded" width="1.25em" height="1.25em" />
        </ElButton>
        <ElButton title="remove" circle>
          <Icon icon="material-symbols:delete-outline-rounded" width="1.25em" height="1.25em" />
        </ElButton>
      </div>
    </div>

    <div class="inline-flex flex-col ml-8 w-full">
      <ElForm label-width="auto">
        <ElRow>
          <ElCol :span="20">
            <ElFormItem :label="$t('label.username')" prop="username">
              <ElInput v-model="form.username"
                :placeholder="$t('placeholder.inputText', { field: $t('label.username') })" :maxLength="50" disabled />
              <p class="my-0 text-xs text-gray-500">Your name may appear around GitHub where you contribute or are
                mentioned.
              </p>
            </ElFormItem>
          </ElCol>
        </ElRow>
        <ElRow>
          <ElCol :span="20">
            <ElFormItem :label="$t('label.fullName')" prop="fullName">
              <ElInput v-model="form.fullName"
                :placeholder="$t('placeholder.inputText', { field: $t('label.fullName') })" :maxLength="50"
                :disabled="!state.fullName" />
              <p class="my-0 text-xs text-gray-500">Get important notifications about you or activity
                you've
                missed.
              </p>
            </ElFormItem>
          </ElCol>
          <ElCol :span="4">
            <ElButton link type="primary" class="mt-2 ml-4" @click="state.fullName = !state.fullName">
              {{ state.fullName ? $t('action.save') : $t('action.modify') }}</ElButton>
          </ElCol>
        </ElRow>
        <ElRow>
          <ElCol :span="20">
            <ElFormItem :label="$t('label.email')" prop="email">
              <ElInput type="email" v-model="form.email"
                :placeholder="$t('placeholder.inputText', { field: $t('label.email') })" :maxLength="50"
                :disabled="!state.email" />
              <p class="my-0 text-xs text-gray-500">Get important notifications about you or activity
                you've
                missed.
              </p>
            </ElFormItem>
          </ElCol>
          <ElCol :span="4">
            <ElButton link type="primary" class="mt-2 ml-4" @click="state.email = !state.email">
              {{ state.email ? $t('action.save') : $t('action.modify') }}
            </ElButton>
          </ElCol>
        </ElRow>
      </ElForm>
    </div>
  </div>

  <div class="mt-8">
    <h3>Third accouts authorize</h3>
    <ul class="mt-4 px-4">
      <li class="flex justify-between py-2">
        <div>
          <div class="inline-flex items-center">
            <Icon icon="simple-icons:github" width="24" height="24" class="mr-2" />
            <label for="comments" class="font-medium text-gray-900">{{ $t('github') }}</label>
          </div>
          <p class="mt-0 text-xs text-(--el-text-color-secondary)">No account relation.
          </p>
        </div>
        <ElButton link type="primary">绑定</ElButton>
      </li>
      <li class="flex justify-between py-2">
        <div>
          <div class="inline-flex items-center">
            <Icon icon="simple-icons:gitee" width="24" height="24" class="mr-2" />
            <label for="candidates" class="font-medium text-gray-900">{{ $t('gitee') }}
            </label>
            <Icon icon="material-symbols:link-rounded" width="16" height="16" class="mx-3" />
            <ElLink type="primary" href="https://www.gitee.com/" target="_blank">example@example.com</ElLink>
          </div>

          <p class="mt-0 text-xs text-(--el-text-color-secondary)">Last used within the last 2 years.</p>
        </div>
        <ElButton link type="danger">解绑</ElButton>
      </li>
      <li class="flex justify-between py-2">
        <div>
          <div class="inline-flex items-center">
            <Icon icon="simple-icons:youtube" width="24" height="24" class="mr-2" />
            <label for="candidates" class="font-medium text-gray-900">{{ $t('youtube') }}</label>
            <Icon icon="material-symbols:link-rounded" width="16" height="16" class="mx-3" />
            <ElLink type="primary" href="https://www.youtube.com/" target="_blank">example@example.com</ElLink>
          </div>
          <p class="mt-0 text-xs text-(--el-text-color-secondary)">Last used within the last 2 years.
          </p>
        </div>
        <ElButton link type="danger">解绑</ElButton>
      </li>
      <li class="flex justify-between py-2">
        <div>
          <div class="inline-flex items-center">
            <Icon icon="simple-icons:x" width="24" height="24" class="mr-2" />
            <label for="candidates" class="font-medium text-gray-900">{{ $t('x') }}
            </label>
            <Icon icon="material-symbols:link-rounded" width="16" height="16" class="mx-3" />
            <ElLink type="primary" href="https://www.x.com/" target="_blank">example@example.com</ElLink>
          </div>
          <p class="mt-0 text-xs text-(--el-text-color-secondary)">Last used within the last 2 years.
          </p>
        </div>
        <ElButton link type="danger">解绑</ElButton>
      </li>
      <li class="flex justify-between py-2">
        <div>
          <div class="inline-flex items-center">
            <Icon icon="simple-icons:xiaohongshu" width="24" height="24" class="mr-2" />
            <label for="candidates" class="font-medium text-gray-900">{{ $t('rednote') }}</label>
            <Icon icon="material-symbols:link-rounded" width="16" height="16" class="mx-3" />
            <ElLink type="primary" href="https://www.xiaohongshu.com/" target="_blank">example@example.com</ElLink>
          </div>
          <p class="mt-0 text-xs text-(--el-text-color-secondary)">Last used within the last 2 years.
          </p>
        </div>
        <ElButton link type="danger">解绑</ElButton>
      </li>
    </ul>
  </div>
</template>