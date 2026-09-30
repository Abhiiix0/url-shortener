
import { Link } from 'react-router-dom'
import Pagination from '../components/Pagination'
import SampleTag from '../components/SampleTag'
import { formatCount, formatIssued } from '../lib/format'
import type { UrlListItem } from '../lib/types'
import { useEffect, useState } from 'react'

const PAGE_SIZE = 8

function Analytics() {
  const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '')

  const [allShortUrls, setAllShortUrls] = useState<UrlListItem[]>([])
  const [page, setPage] = useState(1)

  const getAllUrls = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/analytics`)
      const result = await response.json()

      console.log('result', result?.allUrls)

      return result?.allUrls ?? []
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
      return []
    }
  }

  useEffect(() => {
    const fetchUrls = async () => {
      const realUrls = await getAllUrls()
      setAllShortUrls(realUrls)
    }

    fetchUrls()
  }, [])

  console.log('realUrls', allShortUrls)

  const totalOpens = allShortUrls.reduce(
    (sum, url) => sum + (url._count?.clicks ?? 0),
    0
  )

  const totalPages = Math.max(1, Math.ceil(allShortUrls.length / PAGE_SIZE))
  // Clamp rather than store: keeps page in range if the list shrinks, without an extra render.
  const currentPage = Math.min(page, totalPages)
  const pageUrls = allShortUrls.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const host = window.location.host

  return (
    <>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <h1 className="m-0 font-display text-[clamp(30px,5vw,44px)] leading-[1.1] tracking-[-0.01em] text-paper">
          Your shipments.
        </h1>

        <SampleTag />
      </div>

      <p className="mt-3.5 max-w-[46ch] text-[15px] leading-[1.65] text-paper-soft">
        {allShortUrls.length}{' '}
        {allShortUrls.length === 1 ? 'link' : 'links'} shipped,{' '}
        {formatCount(totalOpens)} opens in total. Pick one to see who opened it.
      </p>

      <ul className="list-none m-0 mt-8 p-0 w-full flex flex-col gap-3">
        {pageUrls.map((u) => (
          <li key={u.id}>
            <Link
              to={`/analytics/${u.shortCode}`}
              className="block bg-kraft border border-kraft-line rounded-md px-5 py-4 no-underline text-ink-text shadow-[0_14px_28px_-20px_rgba(5,9,20,0.7)] transition-[transform,border-color] hover:-translate-y-px hover:border-ink-text-soft focus-visible:outline-2 focus-visible:outline-stamp focus-visible:outline-offset-2"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="m-0 font-semibold text-[17px] truncate">
                    <span className="text-ink-text-soft">
                      {host}/
                    </span>
                    {u.shortCode}
                  </p>

                  <p className="m-0 mt-1 text-[13px] text-ink-text-soft truncate">
                    {u.originalUrl}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <p className="m-0 text-[22px] leading-none font-semibold tabular-nums">
                    {formatCount(u._count?.clicks)}
                  </p>

                  <p className="m-0 mt-1 text-[11px] font-semibold tracking-[0.04em] uppercase text-ink-text-soft">
                    {u._count?.clicks === 1 ? 'open' : 'opens'}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between gap-3 border-t border-kraft-dim pt-2.5 text-[12px] text-ink-text-soft">
                <span>
                  Issued {formatIssued(new Date(u.createdAt))}
                </span>

                <span aria-hidden="true">
                  Details →
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <Pagination page={currentPage} totalPages={totalPages} onPageChange={setPage} />
    </>
  )
}

export default Analytics

