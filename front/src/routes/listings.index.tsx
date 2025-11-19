import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { authClient } from '~/lib/auth-client'
import {
  fetchPublicListings,
  requestListingDelivery,
  cancelListingDelivery,
  fetchDriverDeliveryRequests,
  listingStatusLabels,
  type ListingSummary,
} from '~/utils/listings'
import { fetchDriverStatus } from '~/utils/drivers'

export const Route = createFileRoute('/listings/')({
  loader: async () => {
    const listings = await fetchPublicListings()
    return { listings }
  },
  component: PublicListingsPage,
})

type RequestFeedback =
  | {
      type: 'success' | 'error'
      message: string
      listingId: string
    }
  | null

function PublicListingsPage() {
  const { listings } = Route.useLoaderData()
  const sessionState = authClient.useSession()
  const userId = sessionState.data?.user.id
  const [isDriver, setIsDriver] = useState(false)
  const [requestingId, setRequestingId] = useState<string | null>(null)
  const [requestFeedback, setRequestFeedback] = useState<RequestFeedback>(null)
  const isLoggedIn = !!userId
  const [driverRequests, setDriverRequests] = useState<Set<string>>(
    () =>
      new Set(
        listings.filter((listing) => listing.viewerHasRequested).map((l) => l.id),
      ),
  )

  useEffect(() => {
    if (!isLoggedIn) {
      setIsDriver(false)
      setDriverRequests(new Set())
      return
    }

    let cancelled = false
    const checkStatus = async () => {
      try {
        const status = await fetchDriverStatus()
        if (!cancelled) {
          setIsDriver(status.isDriver)
        }
      } catch (error) {
        if (!cancelled) {
          console.error('[driver-status] Unable to fetch status', error)
          setIsDriver(false)
        }
      }
    }

    void checkStatus()

    return () => {
      cancelled = true
    }
  }, [isLoggedIn])

  useEffect(() => {
    const shouldLoadRequests = isLoggedIn && isDriver
    if (!shouldLoadRequests) {
      return
    }

    let cancelled = false
    const loadRequests = async () => {
      try {
        const ids = await fetchDriverDeliveryRequests()
        if (!cancelled) {
          setDriverRequests(new Set(ids))
        }
      } catch (error) {
        if (!cancelled) {
          console.error('[driver-request] Unable to fetch', error)
        }
      }
    }

    void loadRequests()

    return () => {
      cancelled = true
    }
  }, [isDriver, isLoggedIn])

  const handleToggleRequest = async (
    listingId: string,
    alreadyRequested: boolean,
  ) => {
    setRequestingId(listingId)
    setRequestFeedback(null)
    setDriverRequests((prev) => {
      const next = new Set(prev)
      if (alreadyRequested) {
        next.delete(listingId)
      } else {
        next.add(listingId)
      }
      return next
    })

    try {
      const result = alreadyRequested
        ? await cancelListingDelivery(listingId)
        : await requestListingDelivery(listingId)

      setRequestFeedback({
        type: 'success',
        message: result.message ?? 'Action effectuée.',
        listingId,
      })
    } catch (error) {
      setDriverRequests((prev) => {
        const next = new Set(prev)
        if (alreadyRequested) {
          next.add(listingId)
        } else {
          next.delete(listingId)
        }
        return next
      })

      const message =
        error instanceof Error
          ? error.message
          : 'Impossible de traiter votre demande.'
      setRequestFeedback({
        type: 'error',
        message,
        listingId,
      })
    } finally {
      setRequestingId(null)
    }
  }

  const canDisplayDriverActions = isLoggedIn && isDriver

  return (
    <section className="space-y-6 p-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-wide text-slate-500">
            Explorer
          </p>
          <h1 className="text-2xl font-semibold">Tous les listings</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/mes-listings"
            className="rounded-md border border-slate-300 px-4 py-2 text-slate-700 transition hover:bg-slate-50"
          >
            Voir mes listings
          </Link>
          <Link
            to="/listings/new"
            className="rounded-md bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-800"
          >
            Créer un listing
          </Link>
        </div>
      </header>

      <div className="rounded-md border border-slate-200 bg-white p-4 text-sm text-slate-600">
        Cette page est accessible sans compte pour parcourir les derniers
        listings publiés.
      </div>

      {listings.length === 0 ? (
        <p className="text-sm text-slate-500">
          Aucun listing public n’est disponible pour le moment.
        </p>
      ) : (
        <ul className="space-y-4">
          {listings.map((listing) => {
            const alreadyRequested = driverRequests.has(listing.id)
            const canRequest =
              canDisplayDriverActions &&
              listing.ownerId !== undefined &&
              listing.ownerId !== userId &&
              listing.status === 'published'
            return (
              <ListingCard
                key={listing.id}
                listing={listing}
                canRequestDelivery={canRequest}
                hasRequested={alreadyRequested}
                onRequestDelivery={() =>
                  handleToggleRequest(listing.id, alreadyRequested)
                }
                requesting={requestingId === listing.id}
                feedback={
                  requestFeedback?.listingId === listing.id
                    ? requestFeedback
                    : null
                }
              />
            )
          })}
        </ul>
      )}
    </section>
  )
}

type ListingCardProps = {
  listing: ListingSummary
  canRequestDelivery: boolean
  hasRequested: boolean
  onRequestDelivery: () => void
  requesting: boolean
  feedback: RequestFeedback | null
}

function ListingCard({
  listing,
  canRequestDelivery,
  hasRequested,
  onRequestDelivery,
  requesting,
  feedback,
}: ListingCardProps) {
  return (
    <li className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            {listing.title}
          </h2>
          {listing.shortDescription && (
            <p className="text-sm text-slate-500">{listing.shortDescription}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <StatusBadge status={listing.status} />
          {canRequestDelivery && (
            <div className="flex flex-col items-end gap-1">
              <button
                type="button"
                onClick={onRequestDelivery}
                disabled={requesting}
                className="rounded-md border border-slate-300 px-3 py-1 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
              >
                {requesting
                  ? 'Envoi…'
                  : hasRequested
                    ? 'Annuler la demande'
                    : 'Demander à livrer'}
              </button>
              {feedback && (
                <p
                  className={`text-xs ${
                    feedback.type === 'success'
                      ? 'text-emerald-600'
                      : 'text-rose-600'
                  }`}
                >
                  {feedback.message}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Retrait
          </p>
          <p className="text-sm text-slate-800">{listing.pickupAddress}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Livraison
          </p>
          <p className="text-sm text-slate-800">{listing.deliveryAddress}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Budget estimé
          </p>
          <p className="text-lg font-semibold text-slate-900">
            {formatBudget(listing)}
          </p>
        </div>
      </div>

    </li>
  )
}

function StatusBadge({ status }: { status: ListingSummary['status'] }) {
  const label = listingStatusLabels[status]
  const colorByStatus: Record<ListingSummary['status'], string> = {
    draft: 'bg-slate-200 text-slate-800',
    published: 'bg-emerald-100 text-emerald-700',
    assigned: 'bg-indigo-100 text-indigo-700',
    ready_for_pickup: 'bg-yellow-100 text-yellow-800',
    in_transit: 'bg-blue-100 text-blue-800',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-rose-100 text-rose-700',
    disputed: 'bg-orange-100 text-orange-700',
    archived: 'bg-slate-100 text-slate-500',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${colorByStatus[status]}`}
    >
      {label}
    </span>
  )
}

function formatBudget(listing: ListingSummary) {
  if (!listing.budget || !listing.currency) {
    return 'À définir'
  }

  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: listing.currency,
    maximumFractionDigits: 0,
  }).format(listing.budget)
}
