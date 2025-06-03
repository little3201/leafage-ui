import { defineBoot } from '#q-app/wrappers'
import { setupWorker } from 'msw/browser'
import { handlers } from 'src/mocks' // 您的请求处理程序

export default defineBoot(async ({ router }) => {
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
