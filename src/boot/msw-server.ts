import { defineBoot } from '#q-app/wrappers'
import { setupWorker } from 'msw/browser'
import { handlers } from 'src/mocks'

export default defineBoot(async () => {
  // dev
  if (!process.env.DEV) {
    const worker = setupWorker(...handlers)
    await worker.start({
      onUnhandledRequest: 'bypass',
    })
  }
})
