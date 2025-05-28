<template>
  <ElCard shadow="never">
    <div class="text-center pb-8">
      <h2>常见问题解答（FAQ）</h2>
      <ElInput v-model="searchQuery" placeholder="搜索问题..." clearable style="max-width: 480px;">
        <template #prefix>
          <Icon icon="material-symbols:search-rounded" width="18" height="18" />
        </template>
      </ElInput>
    </div>

    <ElCollapse>
      <ElCollapseItem v-for="faq in faqList" :key="faq.name" :title="faq.title" :name="faq.name">
        <p>{{ faq.content }}</p>
      </ElCollapseItem>
    </ElCollapse>

    <div class="text-center">
      <div class="p-8">
        <h3>仍然有问题？</h3>
        <p>如果您无法在 FAQ 中找到答案，可以随时联系我们，我们会尽快回复您！</p>
      </div>
      <ElRow :gutter="20">
        <ElCol :span="12">
          <div class="bg-[var(--el-bg-color-page)] rounded-xl p-6">
            <Icon icon="material-symbols:phone-in-talk-rounded" width="48" height="48" />
            <p><strong>电话：</strong> +86 123 4567 8901</p>
            <p>We are always happy to help!</p>
          </div>
        </ElCol>
        <ElCol :span="12">
          <div class="bg-[var(--el-bg-color-page)] rounded-xl p-6">
            <Icon icon="material-symbols:mail-outline-rounded" width="48" height="48" />
            <p><strong>邮箱：</strong> hello@help.com</p>
            <p>Best way to get answer faster!</p>
          </div>
        </ElCol>
      </ElRow>
    </div>
  </ElCard>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'

const searchQuery = ref('')
const faqList = [
  { name: '1', title: '如何下单？', content: '您可以通过我们的官网选择商品并添加到购物车，然后进入结算流程完成订单。' },
  { name: '2', title: '我的订单多久能发货？', content: '通常订单会在 1-3 个工作日内处理并发货，具体时间取决于您的所在地和物流方式。' },
  { name: '3', title: '如何申请退货？', content: '如果商品符合退货政策，您可以在订单页面申请退货，并按照指示退回商品。' },
  { name: '4', title: '如何联系客服？', content: '您可以通过我们的在线客服或拨打客服电话：+86 123 4567 8901。' }
]
</script>
