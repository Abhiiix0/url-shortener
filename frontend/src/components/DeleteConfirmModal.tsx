import { useEffect, useRef } from 'react'
import { FaExclamationTriangle, FaRegTrashAlt } from 'react-icons/fa'
import { IoClose } from 'react-icons/io5'

interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  shortCode: string
  originalUrl: string
  host: string
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  shortCode,
  originalUrl,
  host,
}: DeleteConfirmModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const cancelButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen) return

    // Focus cancel button on open for accessibility
    cancelButtonRef.current?.focus()

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    // Prevent body scroll when modal is open
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/75 backdrop-blur-[2px] animate-unfurl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-description"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-[440px] bg-kraft border border-kraft-line rounded-lg shadow-[0_24px_50px_-12px_rgba(5,9,20,0.8)] overflow-hidden"
      >
        {/* Top bar styling */}
        <div className="px-6 pt-5 pb-4 flex items-start justify-between border-b border-kraft-dim">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-stamp/15 border border-stamp/30 text-stamp flex items-center justify-center shrink-0">
              <FaExclamationTriangle className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-[10px] font-bold tracking-[0.1em] uppercase text-stamp">
                Void Shipment
              </span>
              <h2
                id="delete-dialog-title"
                className="m-0 font-semibold text-[17px] text-ink-text leading-tight"
              >
                Delete this shipment?
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

        {/* Modal content */}
        <div className="px-6 py-5">
          <p
            id="delete-dialog-description"
            className="m-0 text-[13px] leading-relaxed text-ink-text-soft"
          >
            Are you sure you want to permanently delete this shortened link? You will no longer be able to access its analytics or redirect visitors.
          </p>

          <div className="mt-3.5 p-3 bg-kraft-light border border-kraft-line rounded text-[12px]">
            <div className="font-semibold text-ink-text truncate">
              <span className="text-ink-text-soft">{host}/</span>
              {shortCode}
            </div>
            <div className="mt-1 text-ink-text-soft truncate text-[11px]" title={originalUrl}>
              {originalUrl}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-3.5 bg-kraft-light/50 border-t border-kraft-dim flex items-center justify-end gap-2.5">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onClose}
            className="font-semibold text-[13px] text-ink-text bg-kraft-light border border-kraft-line rounded px-4 py-2 cursor-pointer transition-colors hover:border-ink-text-soft focus-visible:outline-2 focus-visible:outline-stamp focus-visible:outline-offset-1"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="font-semibold flex items-center gap-1.5 text-[13px] text-paper bg-stamp border border-stamp rounded px-4 py-2 cursor-pointer transition-colors hover:bg-stamp-dim focus-visible:outline-2 focus-visible:outline-ink-text focus-visible:outline-offset-1 shadow-sm"
          >
            <FaRegTrashAlt className="w-3.5 h-3.5" />
            <span>Confirm Delete</span>
          </button>
        </div>
      </div>
    </div>
  )
}
