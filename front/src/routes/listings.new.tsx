import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { createForm } from '@tanstack/react-form'
import { useState } from 'react'
import { authClient } from '~/lib/auth-client'
import { createListing, type ListingFormInput } from '~/utils/listings'

export const Route = createFileRoute('/listings/new')({
  component: NewListingPage,
})

function NewListingPage() {
  const navigate = useNavigate()
  const sessionState = authClient.useSession()
  const user = sessionState.data?.user
  const fieldLabels: Record<keyof ListingFormInput | 'pickupWindowStart' | 'pickupWindowEnd', string> = {
    title: 'Titre',
    shortDescription: 'Description rapide',
    pickupAddress: 'Adresse de retrait',
    deliveryAddress: 'Adresse de livraison',
    budget: 'Budget estimé',
    currency: 'Devise',
    pickupWindowStart: 'Début de fenêtre de retrait',
    pickupWindowEnd: 'Fin de fenêtre de retrait',
  }
  const getFieldClassName = (hasError: boolean) =>
    `w-full rounded-md border px-3 py-2 transition ${
      hasError
        ? 'border-rose-400 focus-visible:outline-rose-500 focus-visible:ring-1 focus-visible:ring-rose-500'
        : 'border-slate-300 focus-visible:outline-slate-900 focus-visible:ring-1 focus-visible:ring-slate-300'
    }`
  const [statusMessage, setStatusMessage] = useState<{
    intent: 'success' | 'error' | null
    text?: string
  }>({ intent: null })

  const form = createForm({
    defaultValues: {
      title: '',
      shortDescription: '',
      pickupAddress: '',
      deliveryAddress: '',
      budget: '50',
      currency: 'EUR',
      pickupWindowStart: '',
      pickupWindowEnd: '',
    },
    validators: {
      title: (value) =>
        value.trim().length === 0 ? 'Le titre est requis.' : undefined,
      pickupAddress: (value) =>
        value.trim().length === 0 ? 'Adresse de retrait requise.' : undefined,
      deliveryAddress: (value) =>
        value.trim().length === 0 ? 'Adresse de livraison requise.' : undefined,
      budget: (value) =>
        Number(value) > 0 ? undefined : 'Le budget doit être supérieur à 0.',
      pickupWindowStart: (value, values) => {
        if (!value || !values.pickupWindowEnd) {
          return undefined
        }
        const startTime = Date.parse(value)
        const endTime = Date.parse(values.pickupWindowEnd)
        if (Number.isNaN(startTime) || Number.isNaN(endTime)) {
          return 'Fenêtre de retrait invalide.'
        }
        return startTime < endTime
          ? undefined
          : 'Le début doit être antérieur à la fin.'
      },
      pickupWindowEnd: (value, values) => {
        if (!value || !values.pickupWindowStart) {
          return undefined
        }
        const startTime = Date.parse(values.pickupWindowStart)
        const endTime = Date.parse(value)
        if (Number.isNaN(startTime) || Number.isNaN(endTime)) {
          return 'Fenêtre de retrait invalide.'
        }
        return endTime > startTime
          ? undefined
          : 'La fin doit être postérieure au début.'
      },
    },
    onSubmit: async ({ value, formApi }) => {
      if (!user) {
        setStatusMessage({
          intent: 'error',
          text: 'Veuillez vous connecter pour créer un listing.',
        })
        return
      }

      setStatusMessage({ intent: null })
      const payload: ListingFormInput = {
        title: value.title.trim(),
        shortDescription: value.shortDescription?.trim() || undefined,
        pickupAddress: value.pickupAddress.trim(),
        deliveryAddress: value.deliveryAddress.trim(),
        budget: Number(value.budget) || 0,
        currency: value.currency,
        pickupWindowStart: value.pickupWindowStart || undefined,
        pickupWindowEnd: value.pickupWindowEnd || undefined,
      }

      const result = await createListing(payload)

      setStatusMessage({
        intent: result.ok ? 'success' : 'error',
        text: result.message,
      })

      if (result.ok) {
        formApi.reset()
        setTimeout(() => {
          navigate({ to: '/listings' })
        }, 350)
      }
    },
  })

  const validationErrors =
    form.state.submitCount > 0
      ? Object.entries(form.state.errors).flatMap(([field, messages]) =>
          (messages ?? []).map((message) => ({
            field,
            message,
          })),
        )
      : []

  const hasValidationErrors = validationErrors.length > 0

  return (
    <section className="space-y-6 p-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500 uppercase tracking-wide">
            Nouveau listing
          </p>
          <h1 className="text-2xl font-semibold">Publier une livraison</h1>
        </div>
        <Link
          to="/listings"
          className="rounded-md border border-slate-300 px-4 py-2 text-slate-700 transition hover:bg-slate-50"
        >
          Retour aux listings
        </Link>
      </header>

      {!user ? (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          Vous devez être connecté pour publier une livraison. Rendez-vous sur{' '}
          <Link to="/auth" className="font-medium underline">
            la page d’authentification
          </Link>{' '}
          pour créer un compte ou vous connecter.
        </div>
      ) : null}

      <form
        onSubmit={(event) => {
          void form.handleSubmit(event)
        }}
        className="space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <form.Field name="title">
            {(field) => {
              const errorMessage = field.state.meta.touchedErrors[0]
              const hasError = Boolean(errorMessage)
              return (
                <FormField
                  label="Titre"
                  required
                  error={errorMessage}
                >
                  <input
                    type="text"
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                    className={getFieldClassName(hasError)}
                    placeholder="Colis Bordeaux → Toulouse"
                  />
                </FormField>
              )
            }}
          </form.Field>
          <form.Field name="budget">
            {(field) => {
              const errorMessage = field.state.meta.touchedErrors[0]
              const hasError = Boolean(errorMessage)
              return (
                <FormField
                  label="Budget estimé (EUR)"
                  required
                  error={errorMessage}
                >
                  <input
                    type="number"
                    min={1}
                    step={5}
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                    className={getFieldClassName(hasError)}
                  />
                </FormField>
              )
            }}
          </form.Field>
        </div>

        <form.Field name="shortDescription">
          {(field) => {
            const errorMessage = field.state.meta.touchedErrors[0]
            const hasError = Boolean(errorMessage)
            return (
              <FormField label="Description rapide" error={errorMessage}>
                <textarea
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                  rows={3}
                  className={getFieldClassName(hasError)}
                  placeholder="Précisez la nature du colis, sa fragilité, les documents à fournir..."
                />
              </FormField>
            )
          }}
        </form.Field>

        <div className="grid gap-4 md:grid-cols-2">
          <form.Field name="pickupAddress">
            {(field) => {
              const errorMessage = field.state.meta.touchedErrors[0]
              const hasError = Boolean(errorMessage)
              return (
                <FormField
                  label="Adresse de retrait"
                  required
                  error={errorMessage}
                >
                  <input
                    type="text"
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                    className={getFieldClassName(hasError)}
                    placeholder="12 Rue de la République, 69002 Lyon"
                  />
                </FormField>
              )
            }}
          </form.Field>
          <form.Field name="deliveryAddress">
            {(field) => {
              const errorMessage = field.state.meta.touchedErrors[0]
              const hasError = Boolean(errorMessage)
              return (
                <FormField
                  label="Adresse de livraison"
                  required
                  error={errorMessage}
                >
                  <input
                    type="text"
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                    className={getFieldClassName(hasError)}
                    placeholder="5 Rue Sainte-Catherine, 33000 Bordeaux"
                  />
                </FormField>
              )
            }}
          </form.Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <form.Field name="pickupWindowStart">
            {(field) => {
              const errorMessage = field.state.meta.touchedErrors[0]
              const hasError = Boolean(errorMessage)
              return (
                <FormField
                  label="Début de fenêtre de retrait"
                  error={errorMessage}
                >
                  <input
                    type="datetime-local"
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                    className={getFieldClassName(hasError)}
                  />
                </FormField>
              )
            }}
          </form.Field>
          <form.Field name="pickupWindowEnd">
            {(field) => {
              const errorMessage = field.state.meta.touchedErrors[0]
              const hasError = Boolean(errorMessage)
              return (
                <FormField
                  label="Fin de fenêtre de retrait"
                  error={errorMessage}
                >
                  <input
                    type="datetime-local"
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                    className={getFieldClassName(hasError)}
                  />
                </FormField>
              )
            }}
          </form.Field>
        </div>

        <form.Field name="currency">
          {(field) => {
            const errorMessage = field.state.meta.touchedErrors[0]
            const hasError = Boolean(errorMessage)
            return (
              <FormField label="Devise" error={errorMessage}>
                <select
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                  className={getFieldClassName(hasError)}
                >
                  <option value="EUR">€ Euro</option>
                  <option value="USD">$ Dollar</option>
                  <option value="GBP">£ Livre sterling</option>
                </select>
              </FormField>
            )
          }}
        </form.Field>

        {hasValidationErrors ? (
          <div className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900">
            <p className="font-medium">
              Corrigez les champs en rouge avant de publier le listing.
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-amber-900">
              {validationErrors.map(({ field, message }, index) => (
                <li key={`${field}-${index}`}>
                  <span className="font-semibold">
                    {fieldLabels[field as keyof typeof fieldLabels] ??
                      field ??
                      'Champ'}
                    :{' '}
                  </span>
                  {message}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {statusMessage.intent && (
          <p
            className={`rounded-md px-3 py-2 text-sm ${
              statusMessage.intent === 'success'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-rose-100 text-rose-800'
            }`}
          >
            {statusMessage.text}
          </p>
        )}

        <div className="flex flex-col gap-3 md:flex-row md:justify-end">
          <form.Subscribe selector={(state) => [state.isSubmitting]}>
            {([isSubmitting]) => (
              <button
                type="submit"
                disabled={isSubmitting || !user}
                className="inline-flex items-center justify-center rounded-md bg-slate-900 px-6 py-2 text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {isSubmitting
                  ? 'Création en cours...'
                  : user
                    ? 'Publier le listing'
                    : 'Connectez-vous pour publier'}
              </button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </section>
  )
}

function FormField({
  label,
  required,
  error,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <label className="space-y-2 text-sm">
      <span className="flex items-center gap-1 text-slate-700">
        {label}
        {required ? (
          <span className="text-xs font-semibold uppercase text-rose-600">
            *
          </span>
        ) : null}
      </span>
      {children}
      {error ? <span className="text-xs text-rose-600">{error}</span> : null}
    </label>
  )
}
