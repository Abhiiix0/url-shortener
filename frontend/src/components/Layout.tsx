import { useEffect } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'

function navClass({ isActive }: { isActive: boolean }) {
  const base =
    'text-[13px] underline-offset-[6px] transition-colors hover:text-paper focus-visible:outline-2 focus-visible:outline-stamp focus-visible:outline-offset-4'
  return isActive
    ? `${base} text-paper underline decoration-stamp decoration-2`
    : `${base} text-paper-soft`
}

function Layout() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="min-h-svh flex flex-col items-center px-5 pt-8 pb-6">
      <header className="w-full max-w-[640px] mb-12 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <Link
          to="/"
          className="font-bold text-[15px] tracking-[0.06em] text-paper no-underline focus-visible:outline-2 focus-visible:outline-stamp focus-visible:outline-offset-4"
        >
          MiniLink
        </Link>
        <nav aria-label="Main" className="flex gap-5">
          <NavLink to="/" end className={navClass}>
            Ship a link
          </NavLink>
          <NavLink to="/analytics" className={navClass}>
            Analytics
          </NavLink>
        </nav>
      </header>

      <main className="w-full max-w-[640px] flex flex-col items-start flex-1">
        <Outlet />
      </main>

      <footer className="w-full max-w-[640px] mt-10 text-xs text-paper-soft opacity-70">
        <p>MiniLink. Ship a link, get a claim tag.</p>
      </footer>
    </div>
  )
}

export default Layout
