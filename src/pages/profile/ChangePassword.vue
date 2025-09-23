<script setup lang="ts">
import { ref } from 'vue'
import type { FormInstance } from 'element-plus'


const formRef = ref<FormInstance>()
const initialValues = {
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
}
const form = ref({ ...initialValues })
// 表单验证规则
const rules = ref({
  oldPassword: [{ required: true, message: 'Please enter your old password', trigger: 'blur' }],
  newPassword: [{ required: true, message: 'Please enter your new password', trigger: 'blur' }],
  confirmPassword: [
    { required: true, message: 'Please confirm your new password', trigger: 'blur' }
  ]
})

// 提交密码修改
async function onSubmit(formEl: FormInstance | undefined) {
  if (!formEl) return

  formEl.validate((valid) => {
    if (valid) {
      alert('success')
    } else {
      alert('error')
    }
  })
}

</script>

<template>
  <h3>{{ $t('changePassword') }}</h3>
  <ElForm ref="formRef" :model="form" :rules="rules" label-width="auto">
    <ElRow class="items-baseline">
      <ElCol :span="14">
        <ElFormItem :label="$t('oldPassword')" prop="oldPassword">
          <ElInput v-model="form.oldPassword" type="password" minlength="8" maxlength="32" show-password>
          </ElInput>
        </ElFormItem>
      </ElCol>
      <ElCol :span="10">
        <span class="ml-4 text-xs text-[var(--el-text-color-secondary)]">
          This is a hint for old password
        </span>
      </ElCol>
    </ElRow>
    <ElRow class="items-baseline">
      <ElCol :span="14">
        <ElFormItem :label="$t('newPassword')" prop="newPassword">
          <ElInput v-model="form.newPassword" type="password" minlength="8" maxlength="32" show-password />
        </ElFormItem>
      </ElCol>
      <ElCol :span="10">
        <span class="ml-4 text-xs text-[var(--el-text-color-secondary)]">
          This is a hint for new password
        </span>
      </ElCol>
    </ElRow>
    <ElRow class="items-baseline">
      <ElCol :span="14">
        <ElFormItem :label="$t('confirmPassword')" prop="confirmPassword">
          <ElInput v-model="form.confirmPassword" type="password" minlength="8" maxlength="32" show-password>
          </ElInput>
        </ElFormItem>
      </ElCol>
      <ElCol :span="10">
        <span class="ml-4 text-xs text-[var(--el-text-color-secondary)]">
          This is a hint for confirm password
        </span>
      </ElCol>
    </ElRow>

    <ElFormItem>
      <ElButton title="submit" type="primary" @click="onSubmit(formRef)">Submit</ElButton>
    </ElFormItem>
  </ElForm>
</template>