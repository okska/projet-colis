import { createAuthClient } from 'better-auth/react'

const baseURL = import.meta.env.VITE_BETTER_AUTH_URL ?? '/api/auth'

export const authClient = createAuthClient({
  baseURL,
})
