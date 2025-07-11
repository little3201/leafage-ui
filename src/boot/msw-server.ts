import { defineBoot } from '#q-app/wrappers'
import { setupWorker } from 'msw/browser'
import { handlers } from 'src/mocks'

export default defineBoot(({ router }) => {
  // dev
  if (!process.env.DEV) {

    router.addRoute({
      path: '/login',
      name: 'login',
      component: () => import('pages/LoginPage.vue')
    })

    const worker = setupWorker(...handlers)
    worker.start({
      onUnhandledRequest: 'bypass'
    })
  }
})
