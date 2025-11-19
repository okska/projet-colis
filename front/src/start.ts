import { createMiddleware, createStart } from '@tanstack/react-start'
import type { AppRouterContext } from './router'

const attachRequestMiddleware = createMiddleware<{ context: AppRouterContext }>(
  { type: 'request' },
).server(async (ctx) => {
  return ctx.next({
    context: {
      ...ctx.context,
      serverContext: {
        request: ctx.request,
      },
    },
  })
})

export const startInstance = createStart(() => ({
  requestMiddleware: [attachRequestMiddleware],
}))

export default startInstance
