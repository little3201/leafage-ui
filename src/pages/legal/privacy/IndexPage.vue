<script setup lang="ts">

</script>

<template>
  <ElCard>
    <div class="container mx-auto">
      <h1 class="text-center">隐私政策</h1>

      <div class="space-y-10 text-gray-700">
        <section class="space-y-4">
          <h2 class="text-xl font-semibold">
            1. 信息收集
          </h2>

          <p class="leading-8">
            我们可能会收集您在使用系统过程中主动提供的信息，包括但不限于：
          </p>

          <ul class="list-disc space-y-2 pl-6 leading-8">
            <li>账户信息</li>
            <li>联系方式</li>
            <li>设备与日志信息</li>
            <li>业务数据与操作记录</li>
          </ul>
        </section>

        <section class="space-y-4">
          <h2 class="text-xl font-semibold">
            2. 信息使用
          </h2>

          <p class="leading-8">
            收集的信息将用于：
          </p>

          <ul class="list-disc space-y-2 pl-6 leading-8">
            <li>提供系统服务</li>
            <li>优化用户体验</li>
            <li>安全风控与日志审计</li>
            <li>满足法律法规要求</li>
          </ul>
        </section>

        <section class="space-y-4">
          <h2 class="text-xl font-semibold">
            3. 数据安全
          </h2>

          <p class="leading-8">
            我们会采用合理的安全措施保护您的数据，避免未经授权的访问、泄露或篡改。
          </p>
        </section>

        <section class="space-y-4">
          <h2 class="text-xl font-semibold">
            4. 联系我们
          </h2>

          <p class="leading-8">
            如有任何问题，请联系：
          </p>

          <ElLink type="primary">
            admin@example.com
          </ElLink>
        </section>
      </div>
    </div>
  </ElCard>
</template>