const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

type DriverStatusResponse = {
  isDriver: boolean
}

type FetchDriverStatusOptions = {
  cookie?: string
}

export async function fetchDriverStatus(
  options?: FetchDriverStatusOptions,
): Promise<DriverStatusResponse> {
  const headers: HeadersInit | undefined = options?.cookie
    ? { cookie: options.cookie }
    : undefined

  const response = await fetch(`${apiUrl}/api/me/driver-status`, {
    credentials: 'include',
    headers,
  })

  if (response.status === 401) {
    throw Object.assign(new Error('Authentification requise.'), {
      status: response.status,
    })
  }

  if (!response.ok) {
    throw new Error('Impossible de récupérer le statut livreur.')
  }

  return (await response.json()) as DriverStatusResponse
}
