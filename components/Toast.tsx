'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, X } from 'lucide-react'

export type ToastType = 'success' | 'error'

export interface ToastItem {
  id: string
  type: ToastType
  message: string
}

interface ToastProps {
  toasts: ToastItem[]
  onRemove: (id: string) => void
}

function SingleToast({ toast, onRemove }: { toast: ToastItem; onRemove: (id: string) => void }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Trigger masuk dengan sedikit delay agar animasi muncul
    const enter = setTimeout(() => setVisible(true), 10)
    // Auto-dismiss setelah 4 detik
    const dismiss = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onRemove(toast.id), 300) // tunggu animasi keluar
    }, 4000)

    return () => {
      clearTimeout(enter)
      clearTimeout(dismiss)
    }
  }, [toast.id, onRemove])

  const isSuccess = toast.type === 'success'

  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border px-4 py-3.5 shadow-lg shadow-black/10 backdrop-blur-sm transition-all duration-300 ${
        visible ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
      } ${
        isSuccess
          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
          : 'border-rose-200 bg-rose-50 text-rose-800'
      }`}
    >
      {/* Ikon status */}
      <span className="mt-0.5 shrink-0">
        {isSuccess ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
        ) : (
          <XCircle className="h-5 w-5 text-rose-500" />
        )}
      </span>

      {/* Pesan */}
      <p className="flex-1 text-sm font-medium leading-snug">{toast.message}</p>

      {/* Tombol tutup manual */}
      <button
        onClick={() => {
          setVisible(false)
          setTimeout(() => onRemove(toast.id), 300)
        }}
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg transition ${
          isSuccess
            ? 'text-emerald-500 hover:bg-emerald-100'
            : 'text-rose-500 hover:bg-rose-100'
        }`}
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

/**
 * ToastContainer — ditaruh di root page, muncul di pojok kanan atas.
 * Gunakan hook `useToast` untuk menampilkan notifikasi.
 */
export default function ToastContainer({ toasts, onRemove }: ToastProps) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed right-5 top-5 z-[100] flex w-80 flex-col gap-2">
      {toasts.map(toast => (
        <SingleToast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}
