import { Link, createFileRoute } from '@tanstack/react-router'
import {
  fetchPublicListings,
  listingStatusLabels,
  type ListingSummary,
} from '~/utils/listings'

export const Route = createFileRoute('/listings/')({
  loader: async () => {
    const listings = await fetchPublicListings()
    return { listings }
  },
  component: PublicListingsPage,
})

function PublicListingsPage() {
  const { listings } = Route.useLoaderData()

  return (
    <section className="space-y-6 p-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-wide text-slate-500">
            Explorer
          </p>
          <h1 className="text-2xl font-semibold">Tous les listings</h1>
        </div>
        <Link
          to="/mes-listings"
          className="rounded-md border border-slate-300 px-4 py-2 text-slate-700 transition hover:bg-slate-50"
        >
          Voir mes listings
        </Link>
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
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </ul>
      )}
    </section>
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
