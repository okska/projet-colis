import { Link, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <section className="space-y-6 p-6">
      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm uppercase tracking-wide text-slate-500">
          Projet Colis
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">
          Gérez vos listings de livraison
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Publiez vos trajets, suivez les candidatures des drivers et contrôlez
          l’avancement de chaque colis depuis un seul espace.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/listings/new"
            className="rounded-md bg-slate-900 px-5 py-2 text-white transition hover:bg-slate-800"
          >
            Créer un listing
          </Link>
          <Link
            to="/mes-listings"
            className="rounded-md border border-slate-300 px-5 py-2 text-slate-700 transition hover:bg-slate-50"
          >
            Voir mes listings
          </Link>
          <Link
            to="/listings"
            className="rounded-md border border-slate-300 px-5 py-2 text-slate-700 transition hover:bg-slate-50"
          >
            Voir tous les listings
          </Link>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          À venir très bientôt
        </h2>
        <ul className="mt-3 list-disc space-y-1 pl-6 text-sm text-slate-600">
          <li>Filtres par statut, trajet et disponibilité des drivers.</li>
          <li>Intégration directe avec le back-office listings/driver.</li>
          <li>Notifications pour les nouveaux trajets publiés.</li>
        </ul>
      </div>
    </section>
  )
}
