import { useEffect, useRef, useState, type FormEvent } from 'react'
import { FaLink } from 'react-icons/fa'
import { IoClose } from 'react-icons/io5'

interface CustomUrlModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (nextCode: string) => void
  shortCode: string
  host: string
}

const ALIAS_PATTERN = /^[a-zA-Z0-9_-]{3,32}$/

export default function CustomUrlModal({
  isOpen,
  onClose,
  onSave,
  shortCode,
  host,
}: CustomUrlModalProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState(shortCode)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isOpen) return
    inputRef.current?.focus()
    inputRef.current?.select()

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) {
      setError('Enter a custom URL.')
      return
    }
    if (!ALIAS_PATTERN.test(trimmed)) {
      setError('3-32 characters: letters, numbers, hyphens and underscores only.')
      return
    }
    onSave(trimmed)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/75 backdrop-blur-[2px] animate-unfurl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="custom-url-dialog-title"
      aria-describedby="custom-url-dialog-description"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="relative w-full max-w-[440px] bg-kraft border border-kraft-line rounded-lg shadow-[0_24px_50px_-12px_rgba(5,9,20,0.8)] overflow-hidden">
        <div className="px-6 pt-5 pb-4 flex items-start justify-between border-b border-kraft-dim">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-ink-line/15 border border-ink-line/30 text-ink-text flex items-center justify-center shrink-0">
              <FaLink className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="block text-[10px] font-bold tracking-[0.1em] uppercase text-ink-text-soft">
                Claim tag
              </span>
              <h2
                id="custom-url-dialog-title"
                className="m-0 font-semibold text-[17px] text-ink-text leading-tight"
              >
                Set a custom URL
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="text-ink-text-soft hover:text-ink-text bg-transparent border-0 p-1 cursor-pointer rounded transition-colors focus-visible:outline-2 focus-visible:outline-stamp"
          >
            <IoClose className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="px-6 py-5">
            <p
              id="custom-url-dialog-description"
              className="m-0 text-[13px] leading-relaxed text-ink-text-soft"
            >
              Replace the random code with something memorable.
            </p>

            <label
              htmlFor="custom-url-input"
              className="mt-3.5 block text-[11px] font-semibold tracking-[0.1em] uppercase text-ink-text-soft"
            >
              Custom URL
            </label>
            <div className="mt-1.5 flex items-stretch rounded border border-kraft-line bg-kraft-light overflow-hidden focus-within:border-stamp">
              <span className="flex items-center pl-3.5 pr-1 text-sm text-ink-text-soft select-none">
                {host}/
              </span>
              <input
                ref={inputRef}
                id="custom-url-input"
                type="text"
                autoComplete="off"
                spellCheck={false}
                value={value}
                onChange={(e) => {
                  setValue(e.target.value)
                  if (error) setError('')
                }}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? 'custom-url-error' : 'custom-url-hint'}
                placeholder="my-launch"
                className="min-w-0 flex-1 text-sm text-ink-text bg-transparent placeholder-kraft-muted py-3 pr-3.5 focus-visible:outline-none"
              />
            </div>
            {error ? (
              <p role="alert" id="custom-url-error" className="mt-2 text-[13px] text-stamp-dim">
                {error}
              </p>
            ) : (
              <p id="custom-url-hint" className="mt-2 text-[12px] text-ink-text-soft">
                Letters, numbers, hyphens and underscores only.
              </p>
            )}
          </div>

          <div className="px-6 py-3.5 bg-kraft-light/50 border-t border-kraft-dim flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="font-semibold text-[13px] text-ink-text bg-kraft-light border border-kraft-line rounded px-4 py-2 cursor-pointer transition-colors hover:border-ink-text-soft focus-visible:outline-2 focus-visible:outline-stamp focus-visible:outline-offset-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="font-semibold text-[13px] text-paper bg-stamp border border-stamp rounded px-4 py-2 cursor-pointer transition-colors hover:bg-stamp-dim focus-visible:outline-2 focus-visible:outline-ink-text focus-visible:outline-offset-1 shadow-sm"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
