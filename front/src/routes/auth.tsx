import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { authClient } from '~/lib/auth-client'

type AuthActionResult = {
  data?: unknown
  error?: {
    message?: string
    status?: number
    statusText?: string
  } | null
}

type EmailPasswordClient = typeof authClient & {
  signIn: {
    email: (payload: { email: string; password: string }) => Promise<AuthActionResult>
  }
  signUp: {
    email: (payload: { email: string; password: string }) => Promise<AuthActionResult>
  }
  signOut: () => Promise<AuthActionResult>
}

const emailPasswordAuth = authClient as EmailPasswordClient

const ensureAuthSuccess = (result: AuthActionResult | null | undefined) => {
  if (!result) {
    throw new Error('No response from auth server.')
  }
  if (result.error) {
    const { message, status, statusText } = result.error
    const statusInfo = status ? `${status}${statusText ? ` ${statusText}` : ''}` : statusText
    throw new Error(message ?? (statusInfo ? `Request failed (${statusInfo})` : 'Request failed'))
  }
}

export const Route = createFileRoute('/auth')({
  component: AuthPage,
})

function AuthPage() {
  const sessionState = authClient.useSession()
  const session = sessionState.data
  const user = session?.user
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState<'sign-in' | 'sign-up' | 'sign-out' | null>(null)

  const handleSubmit = async (action: 'sign-in' | 'sign-up') => {
    if (!email || !password) {
      setError('Email and password are required.')
      return
    }
    setPending(action)
    setError(null)
    setStatus(null)
    try {
      const response =
        action === 'sign-up'
          ? await emailPasswordAuth.signUp.email({ email, password })
          : await emailPasswordAuth.signIn.email({ email, password })

      ensureAuthSuccess(response)

      if (action === 'sign-up') {
        setStatus('Account created. Check your inbox if verification is required, then sign in.')
      } else {
        setStatus('Signed in successfully.')
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      setError(message)
    } finally {
      setPending(null)
    }
  }

  const handleSignOut = async () => {
    setPending('sign-out')
    setError(null)
    setStatus(null)
    try {
      const response = await emailPasswordAuth.signOut()
      ensureAuthSuccess(response)
      setStatus('Signed out.')
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to sign out right now.'
      setError(message)
    } finally {
      setPending(null)
    }
  }

  const isFieldsEmpty = !email || !password

  return (
    <div className="space-y-4 p-4 max-w-md">
      <div>
        <h1 className="text-2xl font-semibold">Better Auth</h1>
        <p className="text-sm text-gray-600">
          Sign up or sign in with email. The API is served from your Hono backend at{' '}
          <code>/api/auth/*</code>.
        </p>
      </div>

      <div className="rounded border p-3">
        <p className="font-medium">Session</p>
        {sessionState.isPending ? (
          <p>Loading session...</p>
        ) : user ? (
          <div>
            <p className="text-green-700">Signed in as {user.email}</p>
            <p className="text-sm text-gray-600">User ID: {user.id}</p>
          </div>
        ) : (
          <p className="text-gray-600">No active session.</p>
        )}
        {sessionState.error && (
          <p className="text-sm text-red-600 mt-1">
            Failed to fetch session: {sessionState.error.message}
          </p>
        )}
      </div>

      <form
        className="space-y-2 rounded border p-3"
        onSubmit={(event) => {
          event.preventDefault()
          void handleSubmit('sign-in')
        }}
      >
        <label className="block text-sm font-medium">
          Email
          <input
            className="mt-1 w-full rounded border px-2 py-1"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label className="block text-sm font-medium">
          Password
          <input
            className="mt-1 w-full rounded border px-2 py-1"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>

        <div className="flex gap-2">
          <button
            type="button"
            className="rounded bg-blue-600 px-3 py-1 text-white disabled:opacity-60"
            disabled={isFieldsEmpty || pending === 'sign-in' || pending === 'sign-up'}
            onClick={() => {
              void handleSubmit('sign-in')
            }}
          >
            {pending === 'sign-in' ? 'Signing In…' : 'Sign In'}
          </button>
          <button
            type="button"
            className="rounded border border-blue-600 px-3 py-1 text-blue-600 disabled:opacity-60"
            disabled={isFieldsEmpty || pending === 'sign-in' || pending === 'sign-up'}
            onClick={() => {
              void handleSubmit('sign-up')
            }}
          >
            {pending === 'sign-up' ? 'Signing Up…' : 'Sign Up'}
          </button>
        </div>

        {user && (
          <button
            type="button"
            className="rounded border border-gray-600 px-3 py-1 text-gray-700 disabled:opacity-60"
            disabled={pending === 'sign-out'}
            onClick={() => {
              void handleSignOut()
            }}
          >
            {pending === 'sign-out' ? 'Signing Out…' : 'Sign Out'}
          </button>
        )}

        {status && <p className="text-sm text-green-700">{status}</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
    </div>
  )
}
