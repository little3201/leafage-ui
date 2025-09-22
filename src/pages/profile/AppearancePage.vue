<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import type { FormInstance, FormRules } from 'element-plus'
import { fetchMe } from 'src/api/users'
import type { User } from 'src/types'


const { t } = useI18n()

const formRef = ref<FormInstance>()
const initialValues: User = {
  id: undefined,
  username: '',
  fullname: '',
  email: ''
}
const form = ref<User>({ ...initialValues })

const rules = reactive<FormRules<typeof form>>({
  username: [
    { required: true, message: t('inputText', { field: t('username') }), trigger: 'blur' },
  ],
  fullname: [
    { required: true, message: t('inputText', { field: t('fullname') }), trigger: 'blur' }
  ],
  email: [
    { required: true, message: t('inputText', { field: t('email') }), trigger: 'blur' }
  ]
})

onMounted(() => {
  fetchMe().then(res => { form.value = res.data })
})
</script>

<template>
  <h3>Appearance</h3>
  <ElSpace size="large" alignment="flex-start">
    <ElCard shadow="never" body-class="!px-10">
      <ElAvatar :size="180" :src="form.avatar" />
      <div class="text-center">
        <p class="text-sm text-[var(--el-text-color-secondary)]">Project Manager</p>
      </div>
    </ElCard>

    <ElForm ref="formRef" :model="form" :rules="rules" label-width="auto" class="mx-auto">
      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem :label="$t('username')" prop="username">
            <ElInput v-model="form.username" :placeholder="$t('inputText', { field: $t('username') })" :maxLength="50"
              :disabled="!!form.id" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem :label="$t('fullname')" prop="fullname">
            <ElInput v-model="form.fullname" :placeholder="$t('inputText', { field: $t('fullname') })"
              :maxLength="50" />
          </ElFormItem>
        </ElCol>

      </ElRow>
      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem :label="$t('email')" prop="email">
            <ElInput type="email" v-model="form.email" :placeholder="$t('inputText', { field: $t('email') })"
              :maxLength="50" :disabled="!!form.id" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem :label="$t('birthday')" prop="birthday">
            <ElDatePicker v-model="form.birthday" type="date" :placeholder="$t('selectText')" style="width: 100%;" />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem :label="$t('country')" prop="country">
            <ElSelect v-model="form.country" :placeholder="$t('selectText')" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem :label="$t('province')" prop="province">
            <ElSelect v-model="form.province" :placeholder="$t('selectText')" />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem :label="$t('city')" prop="city">
            <ElSelect v-model="form.city" :placeholder="$t('selectText')" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem :label="$t('street')" prop="street">
            <ElInput v-model="form.street" :placeholder="$t('selectText')" />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow>
        <ElCol>
          <ElFormItem :label="$t('address')" prop="address">
            <ElInput v-model="form.address" :placeholder="$t('inputText')" />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow>
        <ElCol>
          <ElFormItem :label="$t('bio')" prop="bio">
            <ElInput v-model="form.bio" type="textarea" :placeholder="$t('inputText')" />
          </ElFormItem>
        </ElCol>
      </ElRow>


      <ElFormItem>
        <ElButton title="submit" type="primary" class="ml-auto">Submit</ElButton>
      </ElFormItem>
    </ElForm>
  </ElSpace>
</template>