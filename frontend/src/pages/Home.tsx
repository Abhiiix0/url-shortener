import { useEffect, useRef, useState, type FormEvent } from 'react'
import { formatIssued } from '../lib/format'
import { IoQrCodeOutline } from 'react-icons/io5'
import { FaEnvelope, FaFacebook, FaLinkedin, FaRegCopy, FaShare, FaWhatsapp } from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'
import { BsFiletypePng, BsFiletypeSvg } from 'react-icons/bs'
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react'

const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '')

function normalizeUrl(raw: string): string {
  const trimmed = raw.trim()
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

interface Consignment {
  shortUrl: string
  domain: string
  code: string
  original: string
  issued: Date
}

function Home() {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [consignment, setConsignment] = useState<Consignment | null>(null)
  const [copied, setCopied] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [showQr, setShowQr] = useState(false)
  const [sharePos, setSharePos] = useState<{ top: number; left: number } | null>(null)
  const copyTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const qrCanvasRef = useRef<HTMLCanvasElement>(null)
  const qrSvgRef = useRef<SVGSVGElement>(null)
  const shareRef = useRef<HTMLDivElement>(null)
  const shareButtonRef = useRef<HTMLButtonElement>(null)

  const SHARE_MENU_WIDTH = 192

  useEffect(() => {
    if (!showShare) return
    function onPointerDown(e: PointerEvent) {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) {
        setShowShare(false)
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setShowShare(false)
    }
    // The menu is fixed-positioned from a one-time measurement, so treat any
    // scroll/resize as stale and just close it rather than tracking it live.
    function onDismiss() {
      setShowShare(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    window.addEventListener('scroll', onDismiss, true)
    window.addEventListener('resize', onDismiss)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('scroll', onDismiss, true)
      window.removeEventListener('resize', onDismiss)
    }
  }, [showShare])

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
      setShowShare(false)
      setShowQr(false)
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

  function handleDownloadPng() {
    if (!consignment || !qrCanvasRef.current) return
    const link = document.createElement('a')
    link.href = qrCanvasRef.current.toDataURL('image/png')
    link.download = `minilink-${consignment.code}.png`
    link.click()
  }

  function handleDownloadSvg() {
    if (!consignment || !qrSvgRef.current) return
    const xml = new XMLSerializer().serializeToString(qrSvgRef.current)
    const blob = new Blob([`<?xml version="1.0" encoding="UTF-8"?>\n${xml}`], {
      type: 'image/svg+xml',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `minilink-${consignment.code}.svg`
    link.click()
    URL.revokeObjectURL(url)
  }

  function handleShipAnother() {
    setConsignment(null)
    setUrl('')
    setError('')
    setShowShare(false)
    setShowQr(false)
    inputRef.current?.focus()
  }

  async function handleShareClick() {
    if (!consignment) return
    if (navigator.share) {
      try {
        await navigator.share({ title: 'MiniLink', url: consignment.shortUrl })
      } catch {
        // user cancelled the native share sheet, or it's unsupported at runtime — no-op
      }
      return
    }
    setShowQr(false)
    if (!showShare && shareButtonRef.current) {
      const rect = shareButtonRef.current.getBoundingClientRect()
      setSharePos({
        top: rect.bottom + 8,
        left: Math.min(rect.left, window.innerWidth - SHARE_MENU_WIDTH - 16),
      })
    }
    setShowShare((v) => !v)
  }

  function handleToggleQr() {
    setShowShare(false)
    setShowQr((v) => !v)
  }

  return (
    <>
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
                className="font-semibold text-[clamp(20px,4vw,20px)] text-ink-text no-underline border-b-[1.5px] border-transparent transition-colors hover:border-ink-text focus-visible:border-ink-text focus-visible:outline-2 focus-visible:outline-stamp focus-visible:outline-offset-[3px]"
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
                className="font-semibold flex items-center gap-1.5 text-[13px] text-ink-text bg-transparent border border-kraft-line rounded px-3 py-[7px] cursor-pointer transition-colors hover:border-ink-text-soft focus-visible:outline-2 focus-visible:outline-stamp focus-visible:outline-offset-2"
              >
              <FaRegCopy className=' h-4 w-auto'/>
  {copied ? 'Copied' : 'Copy'}
              </button>
              <div className="relative" ref={shareRef}>
                <button
                  ref={shareButtonRef}
                  type="button"
                  onClick={handleShareClick}
                  aria-haspopup="menu"
                  aria-expanded={showShare}
                  className="font-semibold flex items-center gap-1.5 text-[13px] text-ink-text bg-transparent border border-kraft-line rounded px-3 py-[7px] cursor-pointer transition-colors hover:border-ink-text-soft focus-visible:outline-2 focus-visible:outline-stamp focus-visible:outline-offset-2"
                >
                  <FaShare className="h-4 w-auto" />
                  Share
                </button>
                {showShare && sharePos && (
                  <div
                    role="menu"
                    aria-label="Share this link"
                    style={{ position: 'fixed', top: sharePos.top, left: sharePos.left, width: SHARE_MENU_WIDTH }}
                    className="z-20 bg-kraft-light border border-kraft-line rounded shadow-[0_16px_32px_-16px_rgba(5,9,20,0.6)] p-1.5 flex flex-col gap-0.5 animate-unfurl"
                  >
                    <a
                      role="menuitem"
                      href={`https://wa.me/?text=${encodeURIComponent(consignment.shortUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 text-[13px] text-ink-text no-underline rounded px-2.5 py-2 transition-colors hover:bg-kraft-dim/40 focus-visible:outline-2 focus-visible:outline-stamp focus-visible:-outline-offset-2"
                    >
                      <FaWhatsapp className="h-4 w-auto shrink-0" /> WhatsApp
                    </a>
                    <a
                      role="menuitem"
                      href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(consignment.shortUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 text-[13px] text-ink-text no-underline rounded px-2.5 py-2 transition-colors hover:bg-kraft-dim/40 focus-visible:outline-2 focus-visible:outline-stamp focus-visible:-outline-offset-2"
                    >
                      <FaXTwitter className="h-4 w-auto shrink-0" /> X
                    </a>
                    <a
                      role="menuitem"
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(consignment.shortUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 text-[13px] text-ink-text no-underline rounded px-2.5 py-2 transition-colors hover:bg-kraft-dim/40 focus-visible:outline-2 focus-visible:outline-stamp focus-visible:-outline-offset-2"
                    >
                      <FaFacebook className="h-4 w-auto shrink-0" /> Facebook
                    </a>
                    <a
                      role="menuitem"
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(consignment.shortUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 text-[13px] text-ink-text no-underline rounded px-2.5 py-2 transition-colors hover:bg-kraft-dim/40 focus-visible:outline-2 focus-visible:outline-stamp focus-visible:-outline-offset-2"
                    >
                      <FaLinkedin className="h-4 w-auto shrink-0" /> LinkedIn
                    </a>
                    <a
                      role="menuitem"
                      href={`mailto:?subject=${encodeURIComponent('A link for you')}&body=${encodeURIComponent(consignment.shortUrl)}`}
                      className="flex items-center gap-2.5 text-[13px] text-ink-text no-underline rounded px-2.5 py-2 transition-colors hover:bg-kraft-dim/40 focus-visible:outline-2 focus-visible:outline-stamp focus-visible:-outline-offset-2"
                    >
                      <FaEnvelope className="h-4 w-auto shrink-0" /> Email
                    </a>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={handleToggleQr}
                aria-expanded={showQr}
                className="font-semibold flex items-center gap-1.5 text-[13px] text-ink-text bg-transparent border border-kraft-line rounded px-3 py-[7px] cursor-pointer transition-colors hover:border-ink-text-soft focus-visible:outline-2 focus-visible:outline-stamp focus-visible:outline-offset-2"
              >
                <IoQrCodeOutline className=' h-4 w-auto'/> QR
              </button>
            </div>
            {showQr && (
              <div className="mt-4.5 pt-4 border-t border-kraft-line flex items-center gap-4 max-[480px]:flex-col max-[480px]:items-stretch animate-unfurl">
                <div className="shrink-0 self-start p-2.5 bg-kraft-light border border-kraft-line rounded max-[480px]:self-center">
                  <QRCodeCanvas
                    ref={qrCanvasRef}
                    value={consignment.shortUrl}
                    size={104}
                    level="M"
                    marginSize={0}
                    bgColor="#f8f2e2"
                    fgColor="#211a10"
                  />
                  <QRCodeSVG
                    ref={qrSvgRef}
                    value={consignment.shortUrl}
                    size={512}
                    level="M"
                    marginSize={1}
                    bgColor="#f8f2e2"
                    fgColor="#211a10"
                    className="hidden"
                    aria-hidden="true"
                  />
                </div>

                <div className="min-w-0">
                  <p className="m-0 text-[11px] font-semibold tracking-[0.1em] uppercase text-ink-text-soft">
                    Download your QR code
                  </p>
                  <p className="mt-1 mb-0 text-[13px] leading-[1.5] text-ink-text-soft">
                    Scan to open the link, or drop it into a poster, slide, or print.
                  </p>
                  <div className="mt-2.5 flex gap-2 flex-wrap max-[480px]:[&>button]:flex-1">
                    <button
                      type="button"
                      onClick={handleDownloadPng}
                      className="font-semibold flex items-center justify-center gap-1.5 text-[13px] text-ink-text bg-transparent border border-kraft-line rounded px-3 py-[7px] cursor-pointer transition-colors hover:border-ink-text-soft focus-visible:outline-2 focus-visible:outline-stamp focus-visible:outline-offset-2"
                    >
                      <BsFiletypePng className="h-4 w-auto" /> PNG
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadSvg}
                      className="font-semibold flex items-center justify-center gap-1.5 text-[13px] text-ink-text bg-transparent border border-kraft-line rounded px-3 py-[7px] cursor-pointer transition-colors hover:border-ink-text-soft focus-visible:outline-2 focus-visible:outline-stamp focus-visible:outline-offset-2"
                    >
                      <BsFiletypeSvg className="h-4 w-auto" /> SVG
                    </button>
                  </div>
                </div>
              </div>
            )}
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
    </>
  )
}

export default Home
