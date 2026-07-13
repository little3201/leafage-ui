<script setup lang="ts">
import type {
  ElFormItem,
  FormInstance,
  FormItemRule,
  FormRules
} from "element-plus";
import { ref, computed } from "vue";

const formRef = ref<FormInstance>();
const initialValues = {
  oldPassword: "",
  newPassword: "",
  confirmPassword: ""
};
const form = ref({ ...initialValues });
// 表单验证规则
const rules = ref<FormRules>({
  oldPassword: [
    {
      required: true,
      message: "Please enter your old password",
      trigger: ["blur", "change"]
    },
    {
      min: 8,
      message: "Password must be at least 8 characters",
      trigger: ["blur", "change"]
    }
  ],
  newPassword: [
    {
      required: true,
      message: "Please enter your new password",
      trigger: ["blur", "change"]
    },
    {
      min: 8,
      message: "Must be at least 8 characters",
      trigger: ["blur", "change"]
    },
    {
      pattern: /\d/,
      message: "Must contains number",
      trigger: ["blur", "change"]
    },
    {
      pattern: /[A-Z]/,
      message: "Must contains uppercase letter",
      trigger: ["blur", "change"]
    },
    {
      pattern: /[a-z]/,
      message: "Must contains uppercase letter",
      trigger: ["blur", "change"]
    },
    {
      pattern: /[^a-zA-Z0-9]/,
      message: "Must contains special character",
      trigger: ["blur", "change"]
    }
  ],
  confirmPassword: [
    {
      required: true,
      message: "Please confirm your new password",
      trigger: ["blur", "change"]
    },
    {
      validator: (
        _rule: FormItemRule,
        value: string,
        callback: (error?: Error | null) => void
      ) => {
        if (value !== form.value.newPassword) {
          callback(new Error("Passwords do not match"));
        } else {
          callback();
        }
      },
      trigger: ["blur", "change"]
    }
  ]
});

const strengthClass = (index: number) => {
  const score = passwordStrength.value.score;

  if (index > score) {
    return "bg-gray-200";
  }

  switch (passwordStrength.value.level) {
    case "weak":
      return "bg-red-500";

    case "medium":
      return "bg-yellow-500";

    case "strong":
      return "bg-green-500";
  }
};

const passwordStrength = computed(() => {
  const password = form.value.newPassword || "";

  let score = 0;

  if (password.length >= 8) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  return {
    score,
    level: score <= 2 ? "weak" : score <= 3 ? "medium" : "strong"
  };
});

// 提交密码修改
async function onSubmit(formEl: FormInstance) {
  if (!formEl) return;

  const valid = await formEl.validate();
  if (valid) {
    alert("success");
  } else {
    alert("error");
  }
}
</script>

<template>
  <h3>{{ $t("label.changePassword") }}</h3>
  <ElForm ref="formRef" :model="form" :rules="rules" label-width="auto">
    <ElRow>
      <ElCol :span="14" :xl="12">
        <ElFormItem :label="$t('label.oldPassword')" prop="oldPassword">
          <ElInput
            v-model="form.oldPassword"
            type="password"
            maxlength="32"
            show-password
          >
          </ElInput>
        </ElFormItem>
      </ElCol>
      <ElCol :span="10" :xl="12">
        <p class="ml-4 my-2 text-xs text-(--el-text-color-secondary)">
          This is a hint for old password
        </p>
      </ElCol>
    </ElRow>
    <ElRow>
      <ElCol :span="14" :xl="12">
        <ElFormItem :label="$t('label.newPassword')" prop="newPassword">
          <ElInput
            v-model="form.newPassword"
            type="password"
            maxlength="32"
            show-password
          />
          <div class="mt-2 w-full">
            <div class="flex gap-1">
              <span
                v-for="i in 5"
                :key="i"
                class="h-1 flex-1 rounded"
                :class="strengthClass(i)"
              />
            </div>
          </div>
        </ElFormItem>
      </ElCol>
      <ElCol :span="10" :xl="12">
        <p class="ml-4 my-2 text-xs text-(--el-text-color-secondary)">
          This is a hint for new password
        </p>
      </ElCol>
    </ElRow>
    <ElRow>
      <ElCol :span="14" :xl="12">
        <ElFormItem :label="$t('label.confirmPassword')" prop="confirmPassword">
          <ElInput
            v-model="form.confirmPassword"
            type="password"
            maxlength="32"
            show-password
          >
          </ElInput>
        </ElFormItem>
      </ElCol>
      <ElCol :span="10" :xl="12">
        <p class="ml-4 my-2 text-xs text-(--el-text-color-secondary)">
          This is a hint for confirm password
        </p>
      </ElCol>
    </ElRow>

    <ElFormItem>
      <ElButton title="submit" type="primary" @click="onSubmit(formRef!)">{{
        $t("action.submit")
      }}</ElButton>
    </ElFormItem>
  </ElForm>
</template>
