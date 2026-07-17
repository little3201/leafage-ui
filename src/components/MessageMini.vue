<script setup lang="ts">
import { dayjs, ElButton } from "element-plus";
import { Icon } from "@iconify/vue";
import { ref, onMounted } from "vue";
import { globalIcons } from "@/constants";
import { loadIcon } from "@/utils";
import type { Message, MessageInbox, Filter } from "@/types";
import {
  retrieveMessageInbox,
  readMessageInbox,
  readAllMessageInbox
} from "@/api/messages/inbox";

const messages = ref<Array<Message>>([]);

onMounted(async () => {
  await load();
});

/**
 * 加载列表
 */
async function load() {
  const filter: Filter<MessageInbox> = {
    status: { op: "eq", value: "UNREAD" }
  };
  const res = await retrieveMessageInbox({ page: 1, size: 5 }, filter);
  messages.value = res.data.content
    .sort((a: Message, b: Message) =>
      dayjs(b.publishedAt).diff(dayjs(a.publishedAt))
    )
    .map((item: MessageInbox) => item.message);
}

/**
 * read
 * @param row 数据
 */
async function readRow(row: Message) {
  if (row.id) {
    await readMessageInbox(row.id);
  }
}

/**
 * read all
 */
async function readRows() {
  await readAllMessageInbox();
  await load();
}
</script>

<template>
  <ElPopover placement="bottom" :width="350" trigger="click">
    <template #reference>
      <ElButton title="messages" link>
        <Icon
          :icon="loadIcon(globalIcons['ring'])"
          class="text-white"
          width="1.5em"
          height="1.5em"
        />
      </ElButton>
    </template>
    <div>
      <div class="mb-3 flex items-center justify-between">
        <span>通知</span>

        <ElButton link type="primary" @click="readRows()">
          {{ $t("action.readAll") }}
        </ElButton>
      </div>

      <ElScrollbar height="400px" noresize>
        <ul
          v-if="messages && messages.length > 0"
          class="list-none flex flex-col p-0 my-0! space-y-2"
        >
          <li
            v-for="message in messages"
            @click="readRow(message)"
            class="border border-(--el-border-color) rounded-(--el-border-radius-base) px-4 hover:bg-(--el-fill-color) cursor-pointer"
          >
            <h4
              >{{ message?.title }} <ElTag>{{ message.type }}</ElTag></h4
            >
            <ElText line-clamp="2">{{ message?.body }}</ElText>
            <p class="text-xs">{{
              dayjs(message?.publishedAt).format("YYYY-MM-DD HH:mm:ss")
            }}</p>
          </li>
        </ul>
        <ElEmpty v-else />
      </ElScrollbar>

      <div class="mt-3">
        <ElButton class="w-full" @click="$router.push('/messages/inbox')"
          >查看所有</ElButton
        >
      </div>
    </div>
  </ElPopover>
</template>
