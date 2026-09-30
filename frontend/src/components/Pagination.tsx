import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

const arrowBtn =
  'flex items-center justify-center w-9 h-9 rounded border border-kraft-line text-paper-soft bg-transparent cursor-pointer transition-colors hover:text-paper hover:border-ink-line disabled:opacity-30 disabled:cursor-default disabled:hover:text-paper-soft disabled:hover:border-kraft-line focus-visible:outline-2 focus-visible:outline-stamp focus-visible:outline-offset-2'

// First, last, current, and current's immediate neighbors - with an ellipsis
// standing in for whatever's skipped between two non-adjacent pages. Below
// the threshold, everything fits without truncation, so just show it all.
function pageList(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const keep = new Set<number>([1, total, current - 1, current, current + 1])
  const sorted = [...keep].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b)
  const items: (number | 'ellipsis')[] = []
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) items.push('ellipsis')
    items.push(p)
  })
  return items
}

function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <nav aria-label="Pagination" className="w-full mt-8 flex items-center justify-center gap-1.5">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
        className={arrowBtn}
      >
        <FaChevronLeft className="h-3 w-auto" />
      </button>

      {pageList(page, totalPages).map((p, i) =>
        p === 'ellipsis' ? (
          <span
            key={`ellipsis-${i}`}
            aria-hidden="true"
            className="w-9 h-9 flex items-center justify-center text-paper-soft select-none"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            aria-current={p === page ? 'page' : undefined}
            aria-label={`Page ${p}`}
            className={`w-9 h-9 rounded text-[13px] font-semibold tabular-nums cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-stamp focus-visible:outline-offset-2 ${
              p === page
                ? 'bg-stamp border border-stamp text-paper'
                : 'bg-transparent border border-kraft-line text-paper-soft hover:text-paper hover:border-ink-line'
            }`}
          >
            {p}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
        className={arrowBtn}
      >
        <FaChevronRight className="h-3 w-auto" />
      </button>
    </nav>
  )
}

export default Pagination
