const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export const listingStatusLabels = {
  draft: 'Brouillon',
  published: 'Publié',
  assigned: 'Assigné',
  ready_for_pickup: 'Prêt pour retrait',
  in_transit: 'En cours',
  delivered: 'Livré',
  cancelled: 'Annulé',
  disputed: 'En litige',
  archived: 'Archivé',
} as const

export type ListingStatus = keyof typeof listingStatusLabels

export type ListingSummary = {
  id: string
  title: string
  shortDescription?: string
  pickupAddress: string
  deliveryAddress: string
  status: ListingStatus
  budget?: number
  currency?: string
  pickupWindow?: { start: string; end: string }
  createdAt: string
  ownerId?: string
  viewerHasRequested?: boolean
  deliveryRequestCount?: number
}

const sampleListings: ListingSummary[] = [
  {
    id: 'demo-1',
    title: 'Colis médical Nantes → Paris',
    shortDescription: 'Livraison urgente de documents médicaux scellés.',
    pickupAddress: '12 Rue Paul Bellamy, 44000 Nantes',
    deliveryAddress: '45 Rue de Turbigo, 75003 Paris',
    status: 'published',
    budget: 85,
    currency: 'EUR',
    pickupWindow: {
      start: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      end: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    },
    createdAt: new Date().toISOString(),
    ownerId: 'demo-expediteur',
  },
  {
    id: 'demo-2',
    title: 'Carton fragile Lyon → Marseille',
    shortDescription: 'Vases artisanaux, emballage fourni sur place.',
    pickupAddress: '5 Quai des Célestins, 69002 Lyon',
    deliveryAddress: '17 Rue Sainte, 13001 Marseille',
    status: 'assigned',
    budget: 120,
    currency: 'EUR',
    pickupWindow: {
      start: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      end: new Date(Date.now() + 27 * 60 * 60 * 1000).toISOString(),
    },
    createdAt: new Date().toISOString(),
    ownerId: 'demo-expediteur-2',
  },
]

type FetchListingsOptions = {
  cookie?: string
}

export async function fetchListings(
  options?: FetchListingsOptions,
): Promise<ListingSummary[]> {
  const headers: HeadersInit | undefined = options?.cookie
    ? { cookie: options.cookie }
    : undefined

  try {
    const res = await fetch(`${apiUrl}/api/listings`, {
      credentials: 'include',
      headers,
    })
    if (!res.ok) {
      throw new Error('Unable to fetch listings')
    }

    return (await res.json()) as ListingSummary[]
  } catch (error) {
    console.warn(
      '[listings] Impossible de contacter le backend, utilisation des données de démonstration.',
      error,
    )
    return sampleListings
  }
}

export async function fetchPublicListings(): Promise<ListingSummary[]> {
  try {
    const res = await fetch(`${apiUrl}/api/listings/public`)
    if (!res.ok) {
      throw new Error('Unable to fetch listings')
    }

    return (await res.json()) as ListingSummary[]
  } catch (error) {
    console.warn(
      '[listings] Impossible de charger les listings publics, utilisation des données de démonstration.',
      error,
    )
    return sampleListings
  }
}

export async function requestListingDelivery(listingId: string) {
  const response = await fetch(
    `${apiUrl}/api/listings/${listingId}/request-delivery`,
    {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    },
  )

  return handleDeliveryResponse(response)
}

export async function cancelListingDelivery(listingId: string) {
  const response = await fetch(
    `${apiUrl}/api/listings/${listingId}/request-delivery`,
    {
      method: 'DELETE',
      credentials: 'include',
    },
  )

  return handleDeliveryResponse(response)
}

export type ListingDeliveryRequest = {
  id: string
  driverId: string
  driverName?: string | null
  driverEmail?: string | null
  status: string
  createdAt: string
}

export type DriverAssignment = {
  id: string
  listingId: string
  status: string
  createdAt: string
  listingTitle: string
  pickupAddress?: string | null
  deliveryAddress?: string | null
}

export async function fetchDriverDeliveryRequests(options?: {
  cookie?: string
}): Promise<string[]> {
  const headers: HeadersInit | undefined = options?.cookie
    ? { cookie: options.cookie }
    : undefined

  const response = await fetch(`${apiUrl}/api/listings/delivery-requests`, {
    credentials: 'include',
    headers,
  })

  if (!response.ok) {
    throw new Error('Impossible de récupérer vos demandes de livraison.')
  }

  const data = (await response.json()) as { listingIds: string[] }
  return data.listingIds
}

export async function fetchListingRequests(listingId: string) {
  const response = await fetch(
    `${apiUrl}/api/listings/${listingId}/delivery-requests`,
    {
      credentials: 'include',
    },
  )

  const parsed = await tryParseJson(response)

  if (response.status === 401) {
    throw new Error('Veuillez vous connecter pour voir les offres.')
  }

  if (response.status === 403) {
    throw new Error('Seul le propriétaire du listing peut voir les offres.')
  }

  if (!response.ok) {
    const message =
      typeof parsed?.error === 'string'
        ? parsed.error
        : 'Impossible de récupérer les offres des livreurs.'
    throw new Error(message)
  }

  return (parsed ?? []) as ListingDeliveryRequest[]
}

export async function acceptListingRequest(listingId: string, requestId: string) {
  const response = await fetch(
    `${apiUrl}/api/listings/${listingId}/delivery-requests/${requestId}/accept`,
    {
      method: 'POST',
      credentials: 'include',
    },
  )

  const parsed = await tryParseJson(response)

  if (response.status === 401) {
    throw new Error('Veuillez vous connecter pour effectuer cette action.')
  }

  if (response.status === 403) {
    throw new Error('Seul le propriétaire du listing peut accepter une offre.')
  }

  if (!response.ok) {
    const message =
      typeof parsed?.error === 'string'
        ? parsed.error
        : 'Impossible d’accepter cette offre.'
    throw new Error(message)
  }

  return parsed ?? { message: 'Demande acceptée.' }
}

export async function fetchDriverAssignments(options?: {
  cookie?: string
}): Promise<DriverAssignment[]> {
  const headers: HeadersInit | undefined = options?.cookie
    ? { cookie: options.cookie }
    : undefined

  const response = await fetch(`${apiUrl}/api/driver/delivery-requests`, {
    credentials: 'include',
    headers,
  })

  if (response.status === 401) {
    throw new Error('Veuillez vous connecter pour accéder à vos livraisons.')
  }

  if (response.status === 403) {
    throw new Error('Profil livreur requis pour consulter cette page.')
  }

  if (!response.ok) {
    throw new Error('Impossible de récupérer vos livraisons.')
  }

  return (await response.json()) as DriverAssignment[]
}

async function handleDeliveryResponse(response: Response) {
  const parsed = await tryParseJson(response)

  if (response.status === 401) {
    throw new Error('Veuillez vous connecter pour effectuer cette action.')
  }

  if (response.status === 403) {
    throw new Error('Seuls les livreurs peuvent effectuer cette action.')
  }

  if (!response.ok) {
    const message =
      typeof parsed?.error === 'string'
        ? parsed.error
        : 'Impossible de soumettre la demande pour le moment.'
    throw new Error(message)
  }

  return parsed ?? { message: 'Action réalisée.' }
}

async function tryParseJson(response: Response) {
  try {
    return await response.clone().json()
  } catch {
    return undefined
  }
}

export type ListingFormInput = {
  title: string
  shortDescription?: string
  pickupAddress: string
  deliveryAddress: string
  budget: number
  currency: string
  pickupWindowStart?: string
  pickupWindowEnd?: string
}

export async function createListing(data: ListingFormInput) {
  const payload = {
    title: data.title,
    short_description: data.shortDescription,
    pickup_address: data.pickupAddress,
    delivery_address: data.deliveryAddress,
    budget: data.budget,
    currency: data.currency,
    pickup_window: data.pickupWindowStart && data.pickupWindowEnd
      ? {
          start: new Date(data.pickupWindowStart).toISOString(),
          end: new Date(data.pickupWindowEnd).toISOString(),
        }
      : undefined,
  }

  try {
    const res = await fetch(`${apiUrl}/api/listings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      let errorMessage = 'Impossible de créer le listing.'
      try {
        const errorBody = await res.json()
        if (typeof errorBody?.error === 'string') {
          errorMessage = errorBody.error
        }
      } catch {
        const text = await res.text()
        if (text) {
          errorMessage = text
        }
      }
      throw new Error(errorMessage)
    }

    const created = await res.json()
    return {
      ok: true,
      message: 'Listing créé avec succès.',
      listing: created,
    }
  } catch (error) {
    console.warn('[listings] Impossible de créer le listing.', error)
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : 'Impossible de créer le listing pour le moment.',
    }
  }
}
