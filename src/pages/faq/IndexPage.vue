<template>
  <q-page padding>
    <q-card flat>
      <q-card-section>
        <div class="text-center q-mb-md">
          <h5 class="text-weight-bold q-mb-xs">常见问题解答（FAQ）</h5>
          <q-form style="max-width: 480px; margin: 0 auto;">
            <q-input v-model="searchQuery" clearable type="search" placeholder="搜索问题...">
              <template #prepend>
                <q-icon name="sym_r_search" />
              </template>
            </q-input>
          </q-form>
        </div>

        <q-list separator>
          <q-expansion-item v-for="faq in faqList" :key="faq.name" :label="faq.title">
            <p class="q-pa-md">{{ faq.content }}</p>
          </q-expansion-item>
        </q-list>

        <div class="text-center">
          <div class="q-pb-lg">
            <h6 class="q-mb-sm">仍然有问题？</h6>
            <p>如果您无法在 FAQ 中找到答案，可以随时联系我们，我们会尽快回复您！</p>
          </div>
          <div class="row q-gutter-md">
            <div class="col">
              <div :class="[$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-2', 'rounded-borders q-pa-md']">
                <q-icon name="sym_r_phone_in_talk" size="xl" class="q-mb-md" />
                <p class="q-my-xs"><strong>电话：</strong> +86 123 4567 8901</p>
                <p>We are always happy to help!</p>
              </div>
            </div>
            <div class="col">
              <div :class="[$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-2', 'rounded-borders q-pa-md']">
                <q-icon name="sym_r_mail" size="xl" class="q-mb-md" />
                <p class="q-my-xs"><strong>邮箱：</strong> hello@help.com</p>
                <p>Best way to get answer faster!</p>
              </div>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const searchQuery = ref('')
const faqList = [
  { name: '1', title: '如何下单？', content: '您可以通过我们的官网选择商品并添加到购物车，然后进入结算流程完成订单。' },
  { name: '2', title: '我的订单多久能发货？', content: '通常订单会在 1-3 个工作日内处理并发货，具体时间取决于您的所在地和物流方式。' },
  { name: '3', title: '如何申请退货？', content: '如果商品符合退货政策，您可以在订单页面申请退货，并按照指示退回商品。' },
  { name: '4', title: '如何联系客服？', content: '您可以通过我们的在线客服或拨打客服电话：+86 123 4567 8901。' }
]
</script>
