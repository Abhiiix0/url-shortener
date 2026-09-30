import { formatCount } from '../lib/format'
import type { DayCount } from '../lib/types'

const DAYS = 14
const PLOT_HEIGHT = 140

// Smallest 1/2/5 x 10^n step that fits the max in at most 4 gridline intervals.
function niceScale(max: number) {
  for (let mag = 1; ; mag *= 10) {
    for (const m of [1, 2, 5]) {
      const step = m * mag
      if (Math.ceil(max / step) <= 4) {
        return { step, top: Math.ceil(max / step) * step }
      }
    }
  }
}

function lastDays(n: number): string[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date()
    d.setUTCDate(d.getUTCDate() - (n - 1 - i))
    return d.toISOString().slice(0, 10)
  })
}

function parts(date: string) {
  const d = new Date(`${date}T00:00:00Z`)
  return {
    day: d.getUTCDate(),
    month: d.toLocaleDateString(undefined, { month: 'short', timeZone: 'UTC' }),
    long: d.toLocaleDateString(undefined, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      timeZone: 'UTC',
    }),
  }
}

function OpensChart({ clicksByDay }: { clicksByDay: DayCount[] }) {
  const byDate = new Map(clicksByDay.map((d) => [d.date, d.count]))
  const days = lastDays(DAYS).map((date) => ({ date, count: byDate.get(date) ?? 0 }))
  const max = Math.max(...days.map((d) => d.count))
  const { step, top } = niceScale(Math.max(max, 1))
  const ticks = Array.from({ length: top / step + 1 }, (_, i) => i * step)
  const peak = days.findIndex((d) => d.count === max)

  return (
    <figure className="m-0">
      <figcaption className="flex items-baseline justify-between gap-3">
        <h2 className="m-0 text-[11px] font-semibold tracking-[0.1em] uppercase text-ink-text-soft">
          Opens per day
        </h2>
        <span className="text-[11px] text-ink-text-soft">Last {DAYS} days, UTC</span>
      </figcaption>

      <div className="mt-2 pt-4 flex">
        <div
          className="relative w-8 shrink-0 text-[10px] text-ink-text-soft tabular-nums"
          style={{ height: PLOT_HEIGHT }}
          aria-hidden="true"
        >
          {ticks.map((t) => (
            <span
              key={t}
              className="absolute right-2 translate-y-1/2 leading-none"
              style={{ bottom: `${(t / top) * 100}%` }}
            >
              {formatCount(t)}
            </span>
          ))}
        </div>

        <div className="flex-1 min-w-0">
          <div className="relative" style={{ height: PLOT_HEIGHT }}>
            {ticks.map((t) => (
              <div
                key={t}
                className="absolute inset-x-0 h-px bg-kraft-dim"
                style={{ bottom: `${(t / top) * 100}%` }}
              />
            ))}

            <div className="absolute inset-0 flex items-end">
              {days.map((d, i) => {
                const pct = (d.count / top) * 100
                const p = parts(d.date)
                const align =
                  i < 2 ? 'left-0' : i > DAYS - 3 ? 'right-0' : 'left-1/2 -translate-x-1/2'
                return (
                  <div
                    key={d.date}
                    tabIndex={0}
                    role="img"
                    aria-label={`${p.long}: ${d.count} ${d.count === 1 ? 'open' : 'opens'}`}
                    className="group relative flex-1 h-full flex items-end justify-center px-px rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ink-text/60"
                  >
                    <div
                      className="w-full max-w-[24px] rounded-t-[4px] bg-stamp transition-colors group-hover:bg-stamp-dim group-focus-visible:bg-stamp-dim"
                      style={{ height: `${pct}%` }}
                    />
                    {i === peak && (
                      <span
                        className="absolute text-[10px] font-semibold leading-none text-ink-text tabular-nums"
                        style={{ bottom: `calc(${pct}% + 4px)` }}
                        aria-hidden="true"
                      >
                        {formatCount(d.count)}
                      </span>
                    )}
                    <div
                      aria-hidden="true"
                      className={`pointer-events-none absolute z-10 whitespace-nowrap rounded bg-ink px-2 py-1.5 leading-tight opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 ${align}`}
                      style={{ bottom: `calc(${pct}% + 22px)` }}
                    >
                      <span className="block text-[13px] font-semibold text-paper">
                        {formatCount(d.count)}
                      </span>
                      <span className="block text-[11px] text-paper-soft">{p.long}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-1.5 flex" aria-hidden="true">
            {days.map((d, i) => {
              const p = parts(d.date)
              return (
                <div
                  key={d.date}
                  className="flex-1 min-w-0 text-center text-[10px] leading-[1.3] text-ink-text-soft tabular-nums"
                >
                  <div>{p.day}</div>
                  {(i === 0 || p.day === 1) && <div>{p.month}</div>}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <details className="mt-4 text-[12px] text-ink-text-soft">
        <summary className="cursor-pointer w-fit hover:text-ink-text focus-visible:outline-2 focus-visible:outline-stamp focus-visible:outline-offset-2">
          Table view
        </summary>
        <table className="mt-2 w-full border-collapse">
          <caption className="sr-only">Opens per day, last {DAYS} days</caption>
          <thead>
            <tr>
              <th scope="col" className="py-1 text-left font-semibold">
                Date
              </th>
              <th scope="col" className="py-1 text-right font-semibold">
                Opens
              </th>
            </tr>
          </thead>
          <tbody>
            {days.map((d) => (
              <tr key={d.date} className="border-t border-kraft-dim">
                <td className="py-1">{parts(d.date).long}</td>
                <td className="py-1 text-right tabular-nums text-ink-text">{d.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  )
}

export default OpensChart
