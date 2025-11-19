import { Link, createFileRoute, useRouter } from '@tanstack/react-router'
import { useEffect, useState, type FormEvent } from 'react'
import {
  acceptListingRequest,
  fetchListings,
  fetchListingRequests,
  listingStatusLabels,
  type ListingDeliveryRequest,
  type ListingSummary,
} from '~/utils/listings'

export const Route = createFileRoute('/mes-listings')({
  loader: async ({ context }) => {
    const runningOnServer = typeof document === 'undefined'
    const serverCookie = runningOnServer
      ? context?.serverContext?.request?.headers.get('cookie') ?? undefined
      : undefined

    if (runningOnServer && !serverCookie) {
      // During SSR we don't receive auth cookies (domain mismatch), so defer to the client side.
      return {
        listings: [],
        needsClientFetch: true,
      }
    }

    const listings = await fetchListings({ cookie: serverCookie })
    return { listings, needsClientFetch: false }
  },
  component: ListingsPage,
})

function ListingsPage() {
  const { listings, needsClientFetch } = Route.useLoaderData()
  const router = useRouter()
  const [editableListings, setEditableListings] =
    useState<ListingSummary[]>(listings)

  useEffect(() => {
    setEditableListings(listings)
  }, [listings])

  const handleListingUpdate = (
    id: ListingSummary['id'],
    updates: Partial<ListingSummary>,
  ) => {
    setEditableListings((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    )
  }

  useEffect(() => {
    if (needsClientFetch) {
      void router.invalidate()
    }
  }, [needsClientFetch, router])

  if (needsClientFetch) {
    return (
      <section className="space-y-6 p-4">
        <p className="text-sm text-slate-500">Chargement des listings…</p>
      </section>
    )
  }

  return (
    <section className="space-y-6 p-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500 uppercase tracking-wide">
            Vos livraisons
          </p>
          <h1 className="text-2xl font-semibold">Mes listings</h1>
        </div>
        <Link
            to="/listings/new"
          className="rounded-md bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-800"
        >
          Créer un listing
        </Link>
      </header>

      <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
        Les filtres et critères de recherche arriveront bientôt. Vous pourrez
        alors affiner les listings par statut, trajet ou fenêtre de retrait.
      </div>

      {editableListings.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="space-y-4">
          {editableListings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onUpdate={(updates) => handleListingUpdate(listing.id, updates)}
            />
          ))}
        </ul>
      )}
    </section>
  )
}

function EmptyState() {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-8 text-center">
      <p className="text-lg font-medium text-slate-700">
        Aucun listing pour le moment.
      </p>
      <p className="mt-2 text-sm text-slate-500">
        Ajoutez votre première livraison pour commencer à recevoir des demandes
        de drivers.
      </p>
      <div className="mt-4">
        <Link
          to="/listings/new"
          className="inline-flex rounded-md bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-800"
        >
          Nouveau listing
        </Link>
      </div>
    </div>
  )
}

type ListingCardProps = {
  listing: ListingSummary
  onUpdate: (updates: Partial<ListingSummary>) => void
}

function ListingCard({ listing, onUpdate }: ListingCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(listing)
  const [showRequests, setShowRequests] = useState(false)
  const [requests, setRequests] = useState<ListingDeliveryRequest[]>([])
  const [loadingRequests, setLoadingRequests] = useState(false)
  const [requestError, setRequestError] = useState<string | null>(null)
  const [acceptingRequestId, setAcceptingRequestId] = useState<string | null>(null)

  useEffect(() => {
    setDraft(listing)
  }, [listing])

  const handleFieldChange = <K extends keyof ListingSummary>(
    key: K,
    value: ListingSummary[K],
  ) => {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  const handleBudgetChange = (value: string) => {
    handleFieldChange('budget', value === '' ? undefined : Number(value))
  }

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onUpdate(draft)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setDraft(listing)
    setIsEditing(false)
  }

  const handleToggleRequests = async () => {
    const nextShow = !showRequests
    setShowRequests(nextShow)
    if (!nextShow || requests.length > 0) {
      return
    }

    setLoadingRequests(true)
    setRequestError(null)
    try {
      const data = await fetchListingRequests(listing.id)
      setRequests(data)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Impossible de charger les offres pour ce listing.'
      setRequestError(message)
    } finally {
      setLoadingRequests(false)
    }
  }

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
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={listing.status} />
          <button
            type="button"
            onClick={() => setIsEditing((prev) => !prev)}
            className="rounded-md border border-slate-300 px-3 py-1 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            {isEditing ? 'Fermer' : 'Modifier'}
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Retrait
          </p>
          <p className="text-sm text-slate-800">{listing.pickupAddress}</p>
          <p className="text-xs text-slate-500">
            {formatWindow(listing.pickupWindow)}
          </p>
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
          <p className="text-xs text-slate-500">
            Créé le {new Date(listing.createdAt).toLocaleDateString('fr-FR')}
          </p>
        </div>
      </div>
      {listing.status === 'assigned' ? (
        <div className="mt-4 rounded-md border border-slate-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          Un livreur a déjà été accepté pour ce listing.
        </div>
      ) : Boolean(listing.deliveryRequestCount) ? (
        <div className="mt-4 rounded-md border border-slate-200 p-3">
          <button
            type="button"
            onClick={handleToggleRequests}
            className="text-sm font-medium text-slate-700 underline-offset-2 hover:underline"
          >
            {showRequests
              ? 'Masquer les offres des livreurs'
              : `Voir les ${listing.deliveryRequestCount} offre${listing.deliveryRequestCount && listing.deliveryRequestCount > 1 ? 's' : ''}`}
          </button>
          {showRequests && (
            <div className="mt-3 space-y-2">
              {loadingRequests && (
                <p className="text-sm text-slate-500">Chargement des offres…</p>
              )}
              {requestError && (
                <p className="text-sm text-rose-600">{requestError}</p>
              )}
              {!loadingRequests && !requestError && requests.length === 0 && (
                <p className="text-sm text-slate-500">
                  Aucun livreur n’a encore postulé.
                </p>
              )}
              {!loadingRequests && requests.length > 0 && (
                <ul className="space-y-2">
                  {requests.map((req) => (
                    <li
                      key={req.id}
                      className="rounded border border-slate-200 p-2 text-sm"
                    >
                      <div>
                        <p className="font-medium text-slate-900">
                          {req.driverName ?? 'Livreur'}
                        </p>
                        <p className="text-slate-500">{req.driverEmail}</p>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        Demande reçue le{' '}
                        {new Date(req.createdAt).toLocaleString('fr-FR')}
                      </p>
                      {req.status === 'pending' && (
                        <button
                          type="button"
                          onClick={async () => {
                            setAcceptingRequestId(req.id)
                            setRequestError(null)
                            try {
                              await acceptListingRequest(listing.id, req.id)
                              setRequests((prev) =>
                                prev.map((item) =>
                                  item.id === req.id
                                    ? { ...item, status: 'accepted' }
                                    : item.status === 'pending'
                                      ? { ...item, status: 'declined' }
                                      : item,
                                ),
                              )
                              onUpdate({ status: 'assigned' })
                            } catch (error) {
                              const message =
                                error instanceof Error
                                  ? error.message
                                  : 'Impossible d’accepter cette offre.'
                              setRequestError(message)
                            } finally {
                              setAcceptingRequestId(null)
                            }
                          }}
                          disabled={acceptingRequestId === req.id}
                          className="mt-2 rounded border border-emerald-600 px-3 py-1 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {acceptingRequestId === req.id
                            ? 'Validation…'
                            : 'Accepter ce livreur'}
                        </button>
                      )}
                      {req.status === 'accepted' && (
                        <p className="mt-2 text-xs font-semibold uppercase text-emerald-600">
                          Livreur accepté
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      ) : null}
      {isEditing && (
        <form
          className="mt-4 space-y-4 border-t border-slate-200 pt-4"
          onSubmit={handleSave}
        >
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm text-slate-700">
              Titre
              <input
                type="text"
                className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm"
                value={draft.title}
                onChange={(event) =>
                  handleFieldChange('title', event.target.value)
                }
              />
            </label>
            <label className="text-sm text-slate-700">
              Budget
              <input
                type="number"
                className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm"
                value={draft.budget ?? ''}
                onChange={(event) => handleBudgetChange(event.target.value)}
              />
            </label>
          </div>
          <label className="text-sm text-slate-700">
            Description courte
            <input
              type="text"
              className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm"
              value={draft.shortDescription ?? ''}
              onChange={(event) =>
                handleFieldChange('shortDescription', event.target.value)
              }
            />
          </label>
          <label className="text-sm text-slate-700">
            Adresse de retrait
            <input
              type="text"
              className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm"
              value={draft.pickupAddress}
              onChange={(event) =>
                handleFieldChange('pickupAddress', event.target.value)
              }
            />
          </label>
          <label className="text-sm text-slate-700">
            Adresse de livraison
            <input
              type="text"
              className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm"
              value={draft.deliveryAddress}
              onChange={(event) =>
                handleFieldChange('deliveryAddress', event.target.value)
              }
            />
          </label>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm text-slate-700">
              Devise
              <input
                type="text"
                className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm"
                value={draft.currency ?? ''}
                onChange={(event) =>
                  handleFieldChange('currency', event.target.value)
                }
              />
            </label>
            <label className="text-sm text-slate-700">
              Statut
              <select
                className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm"
                value={draft.status}
                onChange={(event) =>
                  handleFieldChange(
                    'status',
                    event.target.value as ListingSummary['status'],
                  )
                }
              >
                {Object.entries(listingStatusLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Enregistrer
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Annuler
            </button>
          </div>
        </form>
      )}
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

function formatWindow(window?: ListingSummary['pickupWindow']) {
  if (!window) {
    return 'Fenêtre à confirmer'
  }

  const formatter = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

  return `${formatter.format(new Date(window.start))} → ${formatter.format(
    new Date(window.end),
  )}`
}
