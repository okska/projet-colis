import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/auth')({
  component: () => <div>Hello from Auth Page!</div>,
})
