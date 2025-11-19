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
