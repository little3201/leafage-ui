import { defineBoot } from '#q-app/wrappers'
import { setupWorker } from 'msw/browser'
import { handlers } from 'src/mocks'

export default defineBoot(async ({ router }) => {
  // dev
  if (process.env.DEV) {
    const worker = setupWorker(...handlers)
    await worker.start({
      onUnhandledRequest: 'bypass'
    })

    router.addRoute({
      path: '/login',
      name: 'login',
      component: () => import('pages/LoginPage.vue')
    })

  }
})
