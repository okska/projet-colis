import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/listings')({
  component: ListingsLayout,
})

function ListingsLayout() {
  return <Outlet />
}
