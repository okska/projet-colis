import { Link, createFileRoute, useRouter } from '@tanstack/react-router'
import { useEffect } from 'react'
import {
  fetchListings,
  listingStatusLabels,
  type ListingSummary,
} from '~/utils/listings'

export const Route = createFileRoute('/mes-listings')({
  loader: async ({ context }) => {
    const serverCookie =
      typeof document === 'undefined'
        ? context?.serverContext?.request?.headers.get('cookie') ?? undefined
        : undefined

    const runningOnServer = typeof document === 'undefined'

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

  useEffect(() => {
    if (needsClientFetch) {
      void router.invalidate({
        to: '/mes-listings',
      })
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

      {listings.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="space-y-4">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
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

function ListingCard({ listing }: { listing: ListingSummary }) {
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
        <StatusBadge status={listing.status} />
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
