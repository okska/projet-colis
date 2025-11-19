import { createFileRoute } from '@tanstack/react-router'

const backendBaseUrl =
  process.env.BACKEND_BASE_URL ?? process.env.VITE_API_URL ?? 'http://localhost:3000'

async function proxyAuthRequest(request: Request) {
  const incomingUrl = new URL(request.url)
  const suffix = incomingUrl.pathname.replace(/^\/api\/auth\//, '')
  const targetUrl = new URL(`/api/auth/${suffix}`, backendBaseUrl)
  targetUrl.search = incomingUrl.search

  const proxiedRequest = new Request(targetUrl, request)
  return fetch(proxiedRequest)
}

export const Route = createFileRoute('/api/auth/$')({
  server: {
    handlers: {
      ANY: ({ request }) => proxyAuthRequest(request),
    },
  },
})
