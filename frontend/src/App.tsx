import { useRef, useState, type FormEvent } from 'react'

const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '')

function normalizeUrl(raw: string): string {
  const trimmed = raw.trim()
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

function formatIssued(date: Date): string {
  return date.toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

interface Consignment {
  shortUrl: string
  domain: string
  code: string
  original: string
  issued: Date
}

function App() {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [consignment, setConsignment] = useState<Consignment | null>(null)
  const [copied, setCopied] = useState(false)
  const copyTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!url.trim()) {
      setError('Enter a link to ship.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch(`${API_BASE}/api/url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: normalizeUrl(url) }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setError(data.message || 'Something went wrong.')
        return
      }
      const parsed = new URL(data.newUrl)
      setConsignment({
        shortUrl: data.newUrl,
        domain: parsed.host,
        code: parsed.pathname.slice(1),
        original: data.originalUrl,
        issued: new Date(data.createdAt),
      })
      setCopied(false)
    } catch {
      setError("Couldn't reach the server. Is it running?")
    } finally {
      setSubmitting(false)
    }
  }

  function handleCopy() {
    if (!consignment) return
    navigator.clipboard.writeText(consignment.shortUrl).catch(() => {})
    setCopied(true)
    if (copyTimeout.current) clearTimeout(copyTimeout.current)
    copyTimeout.current = setTimeout(() => setCopied(false), 1600)
  }

  function handleShipAnother() {
    setConsignment(null)
    setUrl('')
    setError('')
    inputRef.current?.focus()
  }

  return (
    <div className="min-h-svh flex flex-col items-center px-5 pt-8 pb-6">
      <header className="w-full max-w-[640px] mb-12">
        <span className="font-bold text-[15px] tracking-[0.06em] text-paper">
          MiniLink
        </span>
      </header>

      <main className="w-full max-w-[640px] flex flex-col items-start flex-1">
        <h1 className="font-display text-[clamp(34px,6vw,52px)] leading-[1.08] tracking-[-0.01em] text-paper">
          Ship any link.
          <br />
          Get a claim tag back.
        </h1>
        <p className="mt-[18px] max-w-[46ch] text-[15px] leading-[1.65] text-paper-soft">
          Paste a long URL below. We'll print a short one, with a claim tag
          showing when it shipped.
        </p>

        <div className="relative w-full mt-9 bg-kraft rounded-md border border-kraft-line shadow-[0_24px_48px_-24px_rgba(5,9,20,0.6)] overflow-hidden">
          <form
            className="px-6 pt-[22px] pb-6"
            onSubmit={handleSubmit}
            noValidate
          >
            <span className="block text-[11px] font-semibold tracking-[0.1em] uppercase text-ink-text-soft">
              Consignment
            </span>
            <div className="mt-2.5 flex gap-2.5 max-[520px]:flex-col">
              <input
                ref={inputRef}
                type="text"
                inputMode="url"
                placeholder="https://your-long-link.example.com/goes-here"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value)
                  if (error) setError('')
                }}
                aria-label="URL to shorten"
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? 'url-error' : undefined}
                className="flex-1 min-w-0 text-sm text-ink-text bg-kraft-light border border-kraft-line rounded placeholder-kraft-muted px-3.5 py-3 transition-colors focus-visible:border-stamp focus-visible:outline-none"
              />
              <button
                type="submit"
                disabled={submitting}
                className="shrink-0 font-semibold text-sm text-paper bg-stamp border border-stamp rounded px-5 py-3 cursor-pointer transition-colors hover:bg-stamp-dim focus-visible:outline-2 focus-visible:outline-ink-text focus-visible:outline-offset-2 disabled:cursor-default disabled:opacity-70 max-[520px]:w-full"
              >
                {submitting ? 'Shipping…' : 'Ship it'}
              </button>
            </div>
            {error && (
              <p
                className="mt-2 text-[13px] text-stamp-dim"
                id="url-error"
                role="alert"
              >
                {error}
              </p>
            )}
          </form>

          {consignment && <div className="tear" aria-hidden="true" />}

          {consignment && (
            <div className="px-6 pt-[22px] pb-[26px] animate-unfurl">
              <div className="flex items-center justify-between">
                <span className="block text-[11px] font-semibold tracking-[0.1em] uppercase text-ink-text-soft">
                  Claim tag
                </span>
                <span className="font-bold text-[11px] tracking-[0.08em] uppercase text-stamp border-[1.5px] border-stamp rounded px-2 py-[3px] rotate-[-4deg] animate-stamp-in delay-100">
                  Issued
                </span>
              </div>

              <div className="mt-2.5 flex items-center gap-3 flex-wrap">
                <a
                  className="font-semibold text-[clamp(20px,4vw,26px)] text-ink-text no-underline border-b-[1.5px] border-transparent transition-colors hover:border-ink-text focus-visible:border-ink-text focus-visible:outline-2 focus-visible:outline-stamp focus-visible:outline-offset-[3px]"
                  href={consignment.shortUrl}
                  target="_blank"
                  rel="noopener"
                >
                  <span className="text-ink-text-soft">
                    {consignment.domain}/
                  </span>
                  <span>{consignment.code}</span>
                </a>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="font-semibold text-[13px] text-ink-text bg-transparent border border-kraft-line rounded px-3 py-[7px] cursor-pointer transition-colors hover:border-ink-text-soft focus-visible:outline-2 focus-visible:outline-stamp focus-visible:outline-offset-2"
                >
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>

              <dl className="mt-[18px] border-t border-kraft-line pt-3.5">
                <div className="grid grid-cols-[84px_1fr] gap-3 py-[5px] text-[13px] max-[520px]:grid-cols-1 max-[520px]:gap-0.5">
                  <dt className="text-[11px] font-semibold tracking-[0.04em] uppercase text-ink-text-soft pt-0.5">
                    Contents
                  </dt>
                  <dd
                    title={consignment.original}
                    className="m-0 text-ink-text overflow-hidden text-ellipsis whitespace-nowrap max-[520px]:whitespace-normal max-[520px]:break-all"
                  >
                    {consignment.original}
                  </dd>
                </div>
                <div className="grid grid-cols-[84px_1fr] gap-3 py-[5px] text-[13px] max-[520px]:grid-cols-1 max-[520px]:gap-0.5">
                  <dt className="text-[11px] font-semibold tracking-[0.04em] uppercase text-ink-text-soft pt-0.5">
                    Issued
                  </dt>
                  <dd className="m-0 text-ink-text overflow-hidden text-ellipsis whitespace-nowrap max-[520px]:whitespace-normal max-[520px]:break-all">
                    {formatIssued(consignment.issued)}
                  </dd>
                </div>
              </dl>

              <button
                type="button"
                onClick={handleShipAnother}
                className="mt-[18px] text-[13px] text-ink-text-soft bg-transparent border-0 p-0 cursor-pointer underline underline-offset-[3px] transition-colors hover:text-ink-text focus-visible:outline-2 focus-visible:outline-stamp focus-visible:outline-offset-2"
              >
                Ship another
              </button>
            </div>
          )}
        </div>

        <ul className="list-none m-0 mt-8 p-0 flex flex-wrap gap-3">
          <li className="text-xs font-semibold tracking-[0.03em] text-paper-soft border-[1.5px] border-ink-line rounded px-[11px] py-1.5 rotate-[-2deg]">
            No sign-up
          </li>
          <li className="text-xs font-semibold tracking-[0.03em] text-paper-soft border-[1.5px] border-ink-line rounded px-[11px] py-1.5 rotate-[1.5deg]">
            Tracks opens
          </li>
          <li className="text-xs font-semibold tracking-[0.03em] text-paper-soft border-[1.5px] border-ink-line rounded px-[11px] py-1.5 rotate-[-1deg]">
            Runs in your browser
          </li>
        </ul>
      </main>

      <footer className="w-full max-w-[640px] mt-10 text-xs text-paper-soft opacity-70">
        <p>MiniLink. Ship a link, get a claim tag.</p>
      </footer>
    </div>
  )
}

export default App
