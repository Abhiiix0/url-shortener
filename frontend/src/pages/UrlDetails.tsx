import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FaLink, FaPen, FaRegTrashAlt } from 'react-icons/fa'
import Breakdown from '../components/Breakdown'
import CustomUrlModal from '../components/CustomUrlModal'
import DeleteConfirmModal from '../components/DeleteConfirmModal'
import EditUrlModal from '../components/EditUrlModal'
import OpensChart from '../components/OpensChart'
import { fetchAnalytics, UNREACHABLE } from '../lib/api'
import { formatCount, formatIssued } from '../lib/format'
import type { UrlAnalytics } from '../lib/types'

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
const deviceName = (s: string) => (s === 'Unknown' ? 'Desktop / other' : capitalize(s))
const referrerName = (s: string) => s.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')

const backLink =
  'text-[13px] text-paper-soft transition-colors hover:text-paper focus-visible:outline-2 focus-visible:outline-stamp focus-visible:outline-offset-4'

type State =
  | { status: 'loading' }
  | { status: 'notFound' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: UrlAnalytics }

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-kraft-light border border-kraft-line rounded px-3 py-2.5">
      <dt className="text-[11px] font-semibold tracking-[0.04em] uppercase text-ink-text-soft">
        {label}
      </dt>
      <dd className="m-0 mt-1 text-[22px] leading-none font-semibold text-ink-text">
        {formatCount(value)}
      </dd>
    </div>
  )
}

function Heading({ children }: { children: string }) {
  return (
    <h1 className="m-0 font-display text-[clamp(30px,5vw,44px)] leading-[1.1] tracking-[-0.01em] text-paper">
      {children}
    </h1>
  )
}

function Details({ code }: { code: string }) {
  const [state, setState] = useState<State>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleted, setIsDeleted] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isCustomUrlModalOpen, setIsCustomUrlModalOpen] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    fetchAnalytics(code, controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return
        setState(data ? { status: 'ready', data } : { status: 'notFound' })
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        const message =
          err instanceof TypeError
            ? UNREACHABLE
            : err instanceof Error
              ? err.message
              : 'Something went wrong.'
        setState({ status: 'error', message })
      })
    return () => controller.abort()
  }, [code, attempt])

  function retry() {
    setState({ status: 'loading' })
    setAttempt((a) => a + 1)
  }

  function handleConfirmDelete() {
    setIsDeleteModalOpen(false)
    setIsDeleted(true)
  }

  function handleSaveEdit(nextUrl: string) {
    if (state.status !== 'ready') return
    setState({ status: 'ready', data: { ...state.data, originalUrl: nextUrl } })
    setIsEditModalOpen(false)
  }

  function handleSaveCustomUrl(nextCode: string) {
    if (state.status !== 'ready') return
    setState({ status: 'ready', data: { ...state.data, shortCode: nextCode } })
    setIsCustomUrlModalOpen(false)
  }

  if (isDeleted) {
    return (
      <div className="w-full animate-unfurl">
        <Link to="/analytics" className={backLink}>
          ← All shipments
        </Link>

        <div className="relative w-full mt-5 bg-kraft rounded-md border border-kraft-line shadow-[0_24px_48px_-24px_rgba(5,9,20,0.6)] p-6">
          <div className="flex items-center justify-between">
            <span className="block text-[11px] font-semibold tracking-[0.1em] uppercase text-ink-text-soft">
              Claim tag
            </span>
            <span className="font-bold text-[11px] tracking-[0.08em] uppercase text-stamp border-[1.5px] border-stamp rounded px-2 py-[3px] rotate-[-4deg] animate-stamp-in">
              Deleted
            </span>
          </div>

          <h2 className="m-0 mt-3 font-semibold text-[22px] text-ink-text">
            Shipment removed.
          </h2>
          <p className="mt-2 text-[14px] leading-relaxed text-ink-text-soft">
            The link for <strong className="text-ink-text">{window.location.host}/{code}</strong> has been deleted.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/analytics"
              className="font-semibold text-sm text-paper bg-stamp border border-stamp rounded px-4 py-2.5 hover:bg-stamp-dim transition-colors no-underline focus-visible:outline-2 focus-visible:outline-paper focus-visible:outline-offset-2"
            >
              ← Back to shipments
            </Link>
            <Link
              to="/"
              className="font-semibold text-sm text-ink-text bg-transparent border border-kraft-line rounded px-4 py-2.5 hover:border-ink-text-soft transition-colors no-underline focus-visible:outline-2 focus-visible:outline-stamp focus-visible:outline-offset-2"
            >
              Ship a new link
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (state.status === 'loading') {
    return (
      <>
        <Link to="/analytics" className={backLink}>
          ← All shipments
        </Link>
        <p role="status" className="mt-6 text-[15px] text-paper-soft">
          Loading analytics…
        </p>
      </>
    )
  }

  if (state.status === 'notFound') {
    return (
      <>
        <Heading>Shipment not found.</Heading>
        <p className="mt-3.5 max-w-[46ch] text-[15px] leading-[1.65] text-paper-soft">
          There's no claim tag for <span className="text-paper">{code}</span>.
        </p>
        <Link to="/analytics" className={`mt-6 ${backLink}`}>
          ← All shipments
        </Link>
      </>
    )
  }

  if (state.status === 'error') {
    return (
      <>
        <Heading>Couldn't load this.</Heading>
        <p role="alert" className="mt-3.5 max-w-[46ch] text-[15px] leading-[1.65] text-paper-soft">
          {state.message}
        </p>
        <div className="mt-6 flex items-center gap-5">
          <button
            type="button"
            onClick={retry}
            className="font-semibold text-sm text-paper bg-stamp border border-stamp rounded px-5 py-3 cursor-pointer transition-colors hover:bg-stamp-dim focus-visible:outline-2 focus-visible:outline-paper focus-visible:outline-offset-2"
          >
            Try again
          </button>
          <Link to="/analytics" className={backLink}>
            ← All shipments
          </Link>
        </div>
      </>
    )
  }

  const { data } = state
  const host = window.location.host
  const hasOpens = data.humanClicks > 0

  return (
    <>
      <Link to="/analytics" className={backLink}>
        ← All shipments
      </Link>

      <div className="relative w-full mt-5 bg-kraft rounded-md border border-kraft-line shadow-[0_24px_48px_-24px_rgba(5,9,20,0.6)] overflow-hidden">
        <div className="px-6 pt-[22px] pb-6">
          <div className="flex items-center justify-between">
            <span className="block text-[11px] font-semibold tracking-[0.1em] uppercase text-ink-text-soft">
              Claim tag
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="font-semibold flex items-center gap-1.5 text-[12px] text-ink-text-soft hover:text-ink-text bg-transparent border border-kraft-line hover:border-ink-text-soft rounded px-2.5 py-1 cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-stamp focus-visible:outline-offset-2"
                title="Edit destination"
                aria-label="Edit destination"
              >
                <FaPen className="h-3.5 w-auto" />
                <span>Edit</span>
              </button>
              <button
                type="button"
                onClick={() => setIsCustomUrlModalOpen(true)}
                className="font-semibold flex items-center gap-1.5 text-[12px] text-ink-text-soft hover:text-ink-text bg-transparent border border-kraft-line hover:border-ink-text-soft rounded px-2.5 py-1 cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-stamp focus-visible:outline-offset-2"
                title="Set a custom URL"
                aria-label="Set a custom URL"
              >
                <FaLink className="h-3.5 w-auto" />
                <span>Custom URL</span>
              </button>
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                className="font-semibold flex items-center gap-1.5 text-[12px] text-stamp-dim hover:text-stamp bg-transparent border border-kraft-line hover:border-stamp/40 rounded px-2.5 py-1 cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-stamp focus-visible:outline-offset-2"
                title="Delete shipment"
                aria-label="Delete shipment"
              >
                <FaRegTrashAlt className="h-3.5 w-auto" />
                <span>Delete</span>
              </button>
            </div>
          </div>

          <h1 className="m-0 mt-2.5 font-semibold text-[clamp(20px,4vw,26px)] text-ink-text break-all">
            <span className="text-ink-text-soft">{host}/</span>
            {data.shortCode}
          </h1>

          <dl className="mt-[18px] mb-0 border-t border-kraft-line pt-3.5">
            <div className="grid grid-cols-[84px_1fr] gap-3 py-[5px] text-[13px] max-[520px]:grid-cols-1 max-[520px]:gap-0.5">
              <dt className="text-[11px] font-semibold tracking-[0.04em] uppercase text-ink-text-soft pt-0.5">
                Contents
              </dt>
              <dd className="m-0 min-w-0">
                <a
                  href={data.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={data.originalUrl}
                  className="block text-ink-text overflow-hidden text-ellipsis whitespace-nowrap underline underline-offset-[3px] decoration-kraft-line hover:decoration-ink-text max-[520px]:whitespace-normal max-[520px]:break-all"
                >
                  {data.originalUrl}
                </a>
              </dd>
            </div>
            <div className="grid grid-cols-[84px_1fr] gap-3 py-[5px] text-[13px] max-[520px]:grid-cols-1 max-[520px]:gap-0.5">
              <dt className="text-[11px] font-semibold tracking-[0.04em] uppercase text-ink-text-soft pt-0.5">
                Issued
              </dt>
              <dd className="m-0 text-ink-text">
                {formatIssued(new Date(data.createdAt))}
              </dd>
            </div>
          </dl>
        </div>

        <div className="tear" aria-hidden="true" />

        <div className="px-6 pt-[22px] pb-6">
          <dl className="m-0 grid grid-cols-3 gap-2">
            <Stat label="Opens" value={data.humanClicks} />
            <Stat label="Bot hits" value={data.botClicks} />
            <Stat label="Total" value={data.totalClicks} />
          </dl>
          <p className="mt-2.5 mb-0 text-[12px] leading-[1.5] text-ink-text-soft">
            Opens and everything below count real visitors. Bot hits, like link
            previews and crawlers, are counted separately.
          </p>

          <div className="mt-6">
            {hasOpens ? (
              <OpensChart clicksByDay={data.clicksByDay} />
            ) : (
              <p className="m-0 border-t border-kraft-dim pt-4 text-[13px] text-ink-text-soft">
                No opens yet. Share your link and check back.
              </p>
            )}
          </div>
        </div>
      </div>

      {hasOpens && (
        <div className="w-full mt-4 grid gap-4 sm:grid-cols-2">
          <Breakdown title="Countries" items={data.countries} total={data.humanClicks} />
          <Breakdown title="Cities" items={data.cities} total={data.humanClicks} />
          <Breakdown
            title="Devices"
            items={data.devices}
            total={data.humanClicks}
            formatName={deviceName}
          />
          <Breakdown title="Browsers" items={data.browsers} total={data.humanClicks} />
          <Breakdown title="Operating systems" items={data.os} total={data.humanClicks} />
          <Breakdown
            title="Referrers"
            items={data.referrers}
            total={data.humanClicks}
            formatName={referrerName}
          />
        </div>
      )}

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        shortCode={data.shortCode}
        originalUrl={data.originalUrl}
        host={host}
      />
      <EditUrlModal
        key={isEditModalOpen ? 'edit-open' : 'edit-closed'}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveEdit}
        shortCode={data.shortCode}
        originalUrl={data.originalUrl}
        host={host}
      />
      <CustomUrlModal
        key={isCustomUrlModalOpen ? 'custom-open' : 'custom-closed'}
        isOpen={isCustomUrlModalOpen}
        onClose={() => setIsCustomUrlModalOpen(false)}
        onSave={handleSaveCustomUrl}
        shortCode={data.shortCode}
        host={host}
      />
    </>
  )
}

// Keyed by code so navigating between two details pages starts from a fresh loading state.
function UrlDetails() {
  const { code = '' } = useParams()
  return <Details key={code} code={code} />
}

export default UrlDetails
