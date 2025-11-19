import { Link, createFileRoute } from '@tanstack/react-router'
import {
  fetchDriverAssignments,
  type DriverAssignment,
} from '~/utils/listings'

export const Route = createFileRoute('/mes-livraisons')({
  loader: async ({ context }) => {
    const runningOnServer = typeof document === 'undefined'
    const cookie = runningOnServer
      ? context?.serverContext?.request?.headers.get('cookie') ?? undefined
      : undefined

    const assignments = await fetchDriverAssignments({ cookie })
    return { assignments }
  },
  component: DriverAssignmentsPage,
})

function DriverAssignmentsPage() {
  const { assignments } = Route.useLoaderData()

  const pending = assignments.filter((a) => a.status === 'pending')
  const accepted = assignments.filter((a) => a.status === 'accepted')

  return (
    <section className="space-y-6 p-4">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-wide text-slate-500">
          Mes livraisons
        </p>
        <h1 className="text-2xl font-semibold">Livraisons à effectuer</h1>
        <p className="text-sm text-slate-500">
          Retrouvez vos candidatures en attente et les missions déjà validées.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-800">
          Missions acceptées
        </h2>
        {accepted.length === 0 ? (
          <p className="text-sm text-slate-500">
            Aucune mission validée pour le moment.
          </p>
        ) : (
          <AssignmentList items={accepted} highlight="accepted" />
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-800">
          Candidatures en attente
        </h2>
        {pending.length === 0 ? (
          <p className="text-sm text-slate-500">
            Vous n’avez pas de candidatures en attente de validation.
          </p>
        ) : (
          <AssignmentList items={pending} highlight="pending" />
        )}
      </section>

      <div className="pt-4">
        <Link
          to="/listings"
          className="text-sm font-medium text-cyan-700 underline-offset-2 hover:underline"
        >
          Explorer de nouvelles annonces
        </Link>
      </div>
    </section>
  )
}

function AssignmentList({
  items,
  highlight,
}: {
  items: DriverAssignment[]
  highlight: 'pending' | 'accepted'
}) {
  return (
    <ul className="space-y-3">
      {items.map((assignment) => (
        <li
          key={assignment.id}
          className="rounded border border-slate-200 bg-white p-3 shadow-sm"
        >
          <div className="flex flex-col gap-1">
            <p className="text-base font-semibold text-slate-900">
              {assignment.listingTitle}
            </p>
            <p className="text-sm text-slate-600">
              {assignment.pickupAddress ?? 'Adresse de retrait à confirmer'} →{' '}
              {assignment.deliveryAddress ?? 'Adresse de livraison à confirmer'}
            </p>
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <span>
              Candidature envoyée le{' '}
              {new Date(assignment.createdAt).toLocaleString('fr-FR')}
            </span>
            <span
              className={`rounded px-2 py-0.5 font-semibold uppercase ${
                highlight === 'accepted'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {highlight === 'accepted' ? 'Acceptée' : 'En attente'}
            </span>
          </div>
        </li>
      ))}
    </ul>
  )
}
