import { formatCount } from '../lib/format'
import type { Count } from '../lib/types'

const MAX_ROWS = 5

interface BreakdownProps {
  title: string
  items: Count[]
  total: number
  formatName?: (name: string) => string
}

// Keep the top rows and fold the long tail into one "Other" row.
function fold(items: Count[]): Count[] {
  if (items.length <= MAX_ROWS) return items
  const head = items.slice(0, MAX_ROWS - 1)
  const other = items.slice(MAX_ROWS - 1).reduce((sum, i) => sum + i.count, 0)
  return [...head, { name: 'Other', count: other }]
}

function Breakdown({ title, items, total, formatName = (n) => n }: BreakdownProps) {
  return (
    <section className="bg-kraft border border-kraft-line rounded-md px-5 pt-[18px] pb-5 shadow-[0_24px_48px_-24px_rgba(5,9,20,0.6)]">
      <h2 className="m-0 text-[11px] font-semibold tracking-[0.1em] uppercase text-ink-text-soft">
        {title}
      </h2>
      <ul className="list-none m-0 mt-3.5 p-0 flex flex-col gap-3">
        {fold(items).map((item) => {
          const pct = (item.count / total) * 100
          const pctLabel = pct < 1 ? '<1%' : `${Math.round(pct)}%`
          const name = formatName(item.name)
          return (
            <li
              key={item.name}
              title={`${name}: ${item.count} (${pctLabel})`}
              className="group"
            >
              <div className="flex items-baseline justify-between gap-3 text-[13px]">
                <span className="min-w-0 truncate text-ink-text">{name}</span>
                <span className="shrink-0 tabular-nums text-ink-text-soft">
                  <span className="font-semibold text-ink-text">
                    {formatCount(item.count)}
                  </span>{' '}
                  · {pctLabel}
                </span>
              </div>
              <div className="mt-1.5 h-2 rounded-r-[4px] bg-kraft-dim/50">
                <div
                  className="h-full rounded-r-[4px] bg-stamp transition-colors group-hover:bg-stamp-dim"
                  style={{ width: `${Math.max(pct, 2)}%` }}
                />
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export default Breakdown
