import { Outlet } from "@remix-run/react"

export default function ProviderLayout() {
  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 lg:px-10 py-6 sm:py-8 md:py-10 lg:py-12">
      <Outlet />
    </main>
  )
}