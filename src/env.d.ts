/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: ReturnType<typeof DefineComponent>
  export default component
}