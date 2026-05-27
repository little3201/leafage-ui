<template>
  <v-container>
    <div>
      <v-img alt="Placeholder logo" class="mb-4" height="150" src="assets/logo.png" />

      <div class="mb-8 text-center">
        <div class="font-light -mb-1">Welcome to</div>
        <h1 class="text-6xl font-heading font-bold">Vuetify</h1>
      </div>

      <div class="grid md:grid-cols-2 gap-4">
        <v-card
          class="hero-card md:col-span-2"
          image="https://cdn.vuetifyjs.com/docs/images/one/create/feature.png"
          rounded="3xl"
          variant="flat"
        >
          <template #prepend>
            <v-avatar class="ml-2 mr-4" icon="mdi-rocket-launch-outline" size="60" variant="tonal" />
          </template>

          <template #image>
            <v-img class="hidden md:flex" position="top right" />
          </template>

          <template #title>
            <h2 class="text-2xl font-medium my-0">
              Get started
            </h2>
          </template>

          <template #subtitle>
            <div class="leading-7">
              Change this page by updating <v-code>components/HelloWorld.vue</v-code>.
            </div>
          </template>
        </v-card>

        <v-card
          v-for="link in links"
          :key="link.href"
          class="
            h-full py-3 rounded-3xl transition-[border-radius] hover:rounded-lg
            flex items-center [&>.v-card-item]:w-full
            group"
          :href="link.href"
          rel="noopener noreferrer"
          :subtitle="link.subtitle"
          target="_blank"
          :title="link.title"
          variant="flat"
        >
          <template #prepend>
            <v-avatar class="ml-2 mr-4" :icon="link.icon" size="60" variant="tonal" />
          </template>

          <template #append>
            <v-icon
              class="ml-1 opacity-0 transition group-hover:opacity-90 group-hover:-translate-x-1"
              icon="mdi-open-in-new"
            />
          </template>

          <template #subtitle>
            <div class="line-clamp-2 text-wrap">{{ link.subtitle }}</div>
          </template>
        </v-card>
      </div>
    </div>
  </v-container>
</template>

<script setup lang="ts">
const links = [
  {
    href: 'https://vuetifyjs.com/',
    icon: 'mdi-text',
    subtitle: 'Learn about all things Vuetify in our documentation.',
    title: 'Documentation',
  },
  {
    href: 'https://vuetifyjs.com/introduction/why-vuetify/#feature-guides',
    icon: 'mdi-star',
    subtitle: 'Explore available framework Features.',
    title: 'Features',
  },
  {
    href: 'https://vuetifyjs.com/components/all',
    icon: 'mdi-widgets-outline',
    subtitle: 'Discover components in the API Explorer.',
    title: 'Components',
  },
  {
    href: 'https://discord.vuetifyjs.com',
    icon: 'mdi-account-group-outline',
    subtitle: 'Connect with Vuetify developers.',
    title: 'Community',
  },
]
</script>
