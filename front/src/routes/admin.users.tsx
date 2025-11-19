import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import {
  fetchAdminUsers,
  promoteUserToDriver,
  type AdminUser,
  type DriverProfileStatus,
} from '~/utils/users'

type LoaderResult = {
  allowed: boolean
  users: AdminUser[]
  needsClientFetch: boolean
}

const driverStatusLabels: Record<DriverProfileStatus, string> = {
  pending_verification: 'En vérification',
  active: 'Actif',
  suspended: 'Suspendu',
  blocked: 'Bloqué',
}

export const Route = createFileRoute('/admin/users')({
  loader: async ({ context }) => {
    const isServer = typeof document === 'undefined'
    const cookie = isServer
      ? context?.serverContext?.request?.headers.get('cookie') ?? undefined
      : undefined

    try {
      const users = await fetchAdminUsers({ cookie })
      return { allowed: true, users, needsClientFetch: false } satisfies LoaderResult
    } catch (error) {
      const status = (error as Error & { status?: number })?.status
      if (status === 401 || status === 403) {
        // When rendering on the server we don't receive auth cookies (domain mismatch),
        // so defer to the client to retry once it has access to browser cookies.
        if (isServer && !cookie) {
          return { allowed: false, users: [], needsClientFetch: true } satisfies LoaderResult
        }
        return { allowed: false, users: [], needsClientFetch: false } satisfies LoaderResult
      }
      throw error
    }
  },
  component: AdminUsersPage,
})

function AdminUsersPage() {
  const { allowed, users: initialUsers, needsClientFetch } = Route.useLoaderData() as LoaderResult
  const [users, setUsers] = useState<AdminUser[]>(initialUsers)
  const [isAllowed, setIsAllowed] = useState(allowed)
  const [isLoading, setIsLoading] = useState(needsClientFetch)
  const [pendingUserId, setPendingUserId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setUsers(initialUsers)
    setIsAllowed(allowed)
  }, [allowed, initialUsers])

  useEffect(() => {
    if (!needsClientFetch) {
      return
    }

    let cancelled = false

    const fetchUsers = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const users = await fetchAdminUsers()
        if (cancelled) return
        setUsers(users)
        setIsAllowed(true)
      } catch (err) {
        if (cancelled) return
        const status = (err as Error & { status?: number })?.status
        if (status === 401 || status === 403) {
          setIsAllowed(false)
        } else {
          setError(
            err instanceof Error
              ? err.message
              : 'Impossible de charger les utilisateurs.',
          )
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void fetchUsers()

    return () => {
      cancelled = true
    }
  }, [needsClientFetch])

  if (!isAllowed) {
    return (
      <section className="space-y-4 p-4" aria-busy={isLoading}>
        <h1 className="text-2xl font-semibold">Administration</h1>
        {isLoading ? (
          <p className="text-sm text-slate-600">Chargement…</p>
        ) : (
          <p className="text-sm text-slate-600">
            Vous devez être administrateur pour accéder à cette page.
          </p>
        )}
      </section>
    )
  }

  const handlePromote = async (userId: string) => {
    setPendingUserId(userId)
    setError(null)
    try {
      const updated = await promoteUserToDriver(userId)
      setUsers((prev) =>
        prev.map((user) => (user.id === userId ? updated : user)),
      )
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Impossible de mettre à jour ce profil.'
      setError(message)
    } finally {
      setPendingUserId(null)
    }
  }

  return (
    <section className="space-y-4 p-4">
      <header className="space-y-1">
        <p className="text-sm uppercase tracking-wide text-slate-500">
          Administration
        </p>
        <h1 className="text-2xl font-semibold">Gestion des utilisateurs</h1>
        <p className="text-sm text-slate-500">
          Consultez les comptes inscrits et activez leur rôle de livreur.
        </p>
      </header>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-md border border-slate-200 bg-white" aria-busy={isLoading}>
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-2">Utilisateur</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Statut livreur</th>
              <th className="px-4 py-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-sm text-slate-500" colSpan={4}>
                  Aucun utilisateur à afficher.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {user.name ?? 'Utilisateur sans nom'}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{user.email}</td>
                  <td className="px-4 py-3">
                    {user.driverStatus
                      ? driverStatusLabels[user.driverStatus]
                      : 'Non livreur'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handlePromote(user.id)}
                      disabled={user.isDriver || pendingUserId === user.id}
                      className="rounded-md border border-slate-300 px-3 py-1 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
                    >
                      {user.isDriver
                        ? 'Déjà livreur'
                        : pendingUserId === user.id
                        ? 'Activation…'
                        : 'Activer comme livreur'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
