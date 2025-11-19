import { createMiddleware, createStart } from '@tanstack/react-start'
import type { AppRouterContext } from './router'

const attachRequestMiddleware = createMiddleware({ type: 'request' }).server<
  AppRouterContext
>(async ({ next, request, context }) => {
  return next({
    context: {
      ...(context ?? {}),
      serverContext: {
        request,
      },
    },
  })
})

export const startInstance = createStart(() => ({
  requestMiddleware: [attachRequestMiddleware],
}))

export default startInstance
