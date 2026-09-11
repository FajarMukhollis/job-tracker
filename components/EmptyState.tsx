'use client'

import { Briefcase } from 'lucide-react'

interface EmptyStateProps {
  message: string
  actionLabel?: string
  onAction?: () => void
}

export default function EmptyState({ message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white/60 px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100">
        <Briefcase className="h-8 w-8 text-indigo-500" />
      </div>
      <h3 className="mt-5 text-lg font-semibold text-slate-800">Belum ada data</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-6 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:opacity-95"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}