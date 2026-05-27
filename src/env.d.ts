/// <reference types="vite/client" />

declare module '*.vue' {
  const component: ReturnType<typeof DefineComponent>
  export default component
}