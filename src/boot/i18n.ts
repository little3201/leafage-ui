import { createI18n } from 'vue-i18n'
import messages from '@/lang'

export type MessageLanguages = keyof typeof messages
// Type-define 'zh-CN' as the master schema for the resource
export type MessageSchema = (typeof messages)['zhHans']

// See https://vue-i18n.intlify.dev/guide/advanced/typescript.html#global-resource-schema-type-definition

declare module 'vue-i18n' {
  // define the locale messages schema
  export interface DefineLocaleMessage extends MessageSchema {}

  // define the datetime format schema
  export interface DefineDateTimeFormat {}

  // define the number format schema
  export interface DefineNumberFormat {}
}

export const i18n = createI18n<{ message: MessageSchema }, MessageLanguages>({
  locale: 'zhHans',
  legacy: false,
  messages,
})
