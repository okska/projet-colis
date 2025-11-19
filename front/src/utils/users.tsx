const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export type User = {
  id: number
  name: string
  email: string
}

export type DriverProfileStatus =
  | 'pending_verification'
  | 'active'
  | 'suspended'
  | 'blocked'

export type AdminUser = {
  id: string
  name: string | null
  email: string
  driverStatus: DriverProfileStatus | null
  isDriver: boolean
}

type FetchUsersOptions = {
  cookie?: string
}

type MaybeStatusError = Error & { status?: number }

export async function fetchAdminUsers(
  options?: FetchUsersOptions,
): Promise<AdminUser[]> {
  const headers: HeadersInit | undefined = options?.cookie
    ? { cookie: options.cookie }
    : undefined

  const response = await fetch(`${apiUrl}/api/admin/users`, {
    credentials: 'include',
    headers,
  })

  if (response.status === 401 || response.status === 403) {
    const error = new Error('Accès refusé.')
    ;(error as MaybeStatusError).status = response.status
    throw error
  }

  if (!response.ok) {
    throw new Error('Impossible de récupérer les utilisateurs.')
  }

  return (await response.json()) as AdminUser[]
}

export async function promoteUserToDriver(userId: string) {
  const response = await fetch(`${apiUrl}/api/admin/users/${userId}/driver`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (response.status === 401 || response.status === 403) {
    const error = new Error('Accès refusé.')
    ;(error as MaybeStatusError).status = response.status
    throw error
  }

  if (!response.ok) {
    let message = 'Impossible de mettre à jour le profil livreur.'
    try {
      const body = await response.json()
      if (body?.error && typeof body.error === 'string') {
        message = body.error
      }
    } catch {
      const text = await response.text()
      if (text) {
        message = text
      }
    }
    throw new Error(message)
  }

  return (await response.json()) as AdminUser
}
