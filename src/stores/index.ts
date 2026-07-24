import { createPinia } from 'pinia'

/*
 * When adding new properties to stores, you should also
 * extend the `PiniaCustomProperties` interface.
 * @see https://pinia.vuejs.org/core-concepts/plugins.html#typing-new-store-properties
 */
declare module 'pinia' {

  export interface PiniaCustomProperties {
    // add your custom properties here, if any
  }
}

const pinia = createPinia()

// use the plugin
// pinia.use(plugin)

export default pinia
