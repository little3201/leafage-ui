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
import { fetchMessage } from "@/api/messages";
import type {
  Filter,
  Pagination,
  Message,
  MessageInbox,
  MessageTarget
} from "@/types";
import { actionIcon } from "@/utils";
import { onMounted, reactive, ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const loading = ref<boolean>(false);
const datas = ref<Array<MessageInbox>>([]);
const total = ref<number>(0);
const pagination = reactive<Pagination>({
  page: 1,
  size: 10,
  descending: true
});

const status = ref("");
const filter = reactive<Filter<MessageInbox>>({
  status: { op: "eq", value: status.value }
});
const search = ref<string>("");

const initialValues: Message = {
  id: null,
  title: "",
  scope: "ALL",
  type: null,
  targets: []
};
const data = ref<Message>({ ...initialValues });

const filteredDatas = computed<Array<MessageInbox>>(() => {
  const keyword = search.value.trim();

  return keyword
    ? datas.value.filter(item => item.message.title.includes(keyword))
    : datas.value;
});

watch(
  () => route.query.messageId,
  async newVal => {
    if (newVal) {
      const res = await fetchMessage(Number(newVal));
      readRow(res.data, false);
    }
  }
);

onMounted(async () => {
  await load();
});

/**
 * 加载列表
 */
async function load() {
  loading.value = true;

  try {
    const res = await retrieveMessageInbox(pagination, filter);
    const rows = res.data.content.sort((a: MessageInbox, b: MessageInbox) =>
      dayjs(b.message.publishedAt).diff(dayjs(a.message.publishedAt))
    );
    total.value = res.data.page.totalElements;

    const messageId = route.query.messageId;
    if (messageId) {
      const target = datas.value.find(
        item => item.message.id === Number(messageId)
      );

      if (target) {
        await readRow(target.message, false);
      }
    } else if (data.value.id) {
      data.value = { ...data.value };
    } else if (rows.length > 0 && rows[0].message) {
      data.value = rows[0].message;
    }
    datas.value = rows;
  } catch (error) {
    datas.value = [];
    total.value = 0;

    throw error;
  } finally {
    loading.value = false;
  }
}

/**
 * read
 * @param row 数据
 */
async function readRow(row: MessageInbox, clearQuery = true) {
  data.value = { ...row.message };
  if (row.id && row.status === "UNREAD") {
    await readMessageInbox(row.id);
    await load();
  }
  if (clearQuery && route.query.messageId) {
    router.replace({
      query: {}
    });
  }
}

/**
 * read all
 */
async function readRows() {
  await readAllMessageInbox();
  await load();
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
          v-model="search"
          clearable
          :placeholder="$t('placeholder.search')"
        >
          <template #prefix>
            <Icon :icon="actionIcon('search')" width="1.25em" height="1.25em" />
          </template>
        </ElInput>

        <div class="my-4 flex items-center justify-between">
          <ElRadioGroup v-model="status" fill="#409eff" @change="onRadioChange">
            <ElRadioButton :label="$t('label.all')" value="" />
            <ElRadioButton :label="$t('label.unread')" value="UNREAD" />
          </ElRadioGroup>

          <ElButton link type="primary" @click="readRows()">
            {{ $t("action.readAll") }}
          </ElButton>
        </div>

        <ElScrollbar height="calc(100vh - 296px)">
          <ul
            v-if="filteredDatas && filteredDatas.length > 0"
            class="list-none p-0 my-0! space-y-2"
          >
            <li
              v-for="data in filteredDatas"
              @click="readRow(data)"
              class="border border-(--el-border-color) rounded-(--el-border-radius-base) px-4 hover:bg-(--el-fill-color) cursor-pointer"
            >
              <h4 :class="data.status === 'READ' ? 'font-normal' : ''">
                {{ data.message?.title }} <ElTag>{{ data.message.type }}</ElTag>
              </h4>
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
        <div v-if="Object.entries(data) && data.id">
          <h2>
            {{ data.title }} <ElTag>{{ data.type }}</ElTag>
          </h2>
          <div class="space-x-4">
            <ElTag>{{ $t("label.sender") }}：{{ data.sender }}</ElTag>
            <ElTag type="success">
              {{ $t("label.publishedAt") }}：{{
                data.publishedAt
                  ? dayjs(data.publishedAt).format("YYYY-MM-DD HH:mm:ss")
                  : ""
              }}
            </ElTag>
          </div>

          <ElDivider />

          <ElText size="large">{{ data.body }}</ElText>
        </div>

        <ElEmpty v-else></ElEmpty>
      </ElCard>
    </ElCol>
  </ElRow>
</template>
