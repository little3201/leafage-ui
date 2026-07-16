<script setup lang="ts">
import { Icon } from "@iconify/vue";
import type {
  ElButton,
  ElDivider,
  ElEmpty,
  ElRadioButton,
  ElRadioGroup,
  ElScrollbar
} from "element-plus";
import { dayjs } from "element-plus";
import {
  retrieveMessageInbox,
  readMessageInbox,
  readAllMessageInbox
} from "@/api/messages/inbox";
import type { Filter, Pagination, Message, MessageInbox, User } from "@/types";
import { actionIcon } from "@/utils";
import { onMounted, reactive, ref, computed } from "vue";

const loading = ref<boolean>(false);
const datas = ref<Array<MessageInbox>>([]);
const total = ref<number>(0);
const pagination = reactive<Pagination>({
  page: 1,
  size: 10,
  descending: true
});

const status = ref("");
const filter = reactive<Filter<Message>>({
  title: { op: "eq", value: undefined },
  status: { op: "eq", value: status.value }
});

const initialValues: Message = {
  id: null,
  title: "",
  scope: "all",
  type: null,
  receiver: null
};
const data = ref<Message>({ ...initialValues });

const receiverText = computed(() => {
  if (!data.value.receiver) {
    return "所有人";
  }

  return data.value.receiver
    .map((user: User) => `${user.fullName} (${user.email})`)
    .join(", ");
});

onMounted(async () => {
  await load();
});

/**
 * 加载列表
 */
async function load() {
  loading.value = true;

  const res = await retrieveMessageInbox(pagination, filter);
  datas.value = res.data.content;
  total.value = res.data.page.totalElements;

  // set first data
  if (datas.value && datas.value.length > 0 && datas.value[0].message) {
    data.value = datas.value[0].message;
  }
  loading.value = false;
}

/**
 * read
 * @param row 数据
 */
async function readRow(row: Message) {
  data.value = { ...row };
  if (row.id) {
    await readMessageInbox(row.id);
  }
}

/**
 * read all
 */
async function readRows() {
  await readAllMessageInbox();
}

async function onRadioChange(value: string) {
  status.value = value;
  if (filter.status) {
    filter.status.value = value;
  }
  await load();
}
</script>

<template>
  <ElRow :gutter="16">
    <ElCol :span="6" :xl="4">
      <ElCard>
        <ElInput
          v-model="filter.title!.value"
          clearable
          :placeholder="$t('placeholder.search')"
        >
          <template #prefix>
            <Icon :icon="actionIcon('search')" width="1.25em" height="1.25em" />
          </template>
        </ElInput>

        <div class="mt-4 flex items-center justify-between">
          <ElRadioGroup v-model="status" fill="#409eff" @change="onRadioChange">
            <ElRadioButton :label="$t('label.all')" value="" />
            <ElRadioButton :label="$t('label.unread')" value="UNREAD" />
          </ElRadioGroup>

          <ElButton link type="primary" @click="readRows()">
            {{ $t("label.readAll") }}
          </ElButton>
        </div>

        <ElScrollbar height="calc(100vh - 280px)">
          <ul v-if="datas && datas.length > 0" class="list-none pl-0 space-y-2">
            <li
              v-for="data in datas"
              @click="readRow(data.message)"
              class="border border-(--el-card-border-color) rounded-(--el-border-radius-base) px-4 hover:bg-(--el-fill-color) cursor-pointer"
            >
              <h4
                >{{ data.message?.title }}
                <ElTag>{{ data.message.type }}</ElTag></h4
              >
              <ElText line-clamp="2">{{ data.message?.body }}</ElText>
              <p class="text-xs">{{
                dayjs(data.message?.publishedAt).format("YYYY-MM-DD HH:mm:ss")
              }}</p>
            </li>
          </ul>
          <ElEmpty v-else />
        </ElScrollbar>
      </ElCard>
    </ElCol>

    <ElCol :span="18" :xl="20">
      <ElCard style="height: stretch">
        <h2
          >{{ data.title }} <ElTag>{{ data.type }}</ElTag></h2
        >
        <div class="space-x-4">
          <ElTag>{{ $t("label.sender") }}：{{ data.sender }}</ElTag>
          <ElTag>
            {{ $t("label.publishedAt") }}：{{
              dayjs(data.publishedAt).format("YYYY-MM-DD HH:mm:ss")
            }}
          </ElTag>
          <ElTag>{{ $t("label.receiver") }}：{{ receiverText }} </ElTag>
        </div>

        <ElDivider />

        <ElText size="large">{{ data.body }}</ElText>
      </ElCard>
    </ElCol>
  </ElRow>
</template>
