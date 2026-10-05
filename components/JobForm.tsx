'use client'

import { useState } from 'react'
import { Building2, Briefcase, CalendarDays, AlignLeft, Check, Loader2 } from 'lucide-react'
import { STATUS_ORDER, type JobStatus } from '@/lib/status'

export interface JobFormData {
  company_name: string
  position: string
  apply_date: string
  status: JobStatus
  description: string
  reject_note?: string
}

interface JobFormProps {
  initialData?: {
    id?: string
    company_name: string
    position: string
    apply_date: string
    status: JobStatus
    description: string
    reject_note?: string | null
  }
  onSubmit: (data: JobFormData) => Promise<void>
  onCancel: () => void
  isDisabled?: boolean
}

const inputClass = (disabled: boolean) =>
  `mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none ${
    disabled ? 'cursor-not-allowed bg-slate-50 text-slate-500' : ''
  }`

export default function JobForm({ initialData, onSubmit, onCancel, isDisabled = false }: JobFormProps) {
  const [formData, setFormData] = useState<JobFormData>({
    company_name: initialData?.company_name || '',
    position: initialData?.position || '',
    apply_date: initialData?.apply_date || '',
    status: (initialData?.status || 'Apply') as JobStatus,
    description: initialData?.description || '',
    reject_note: initialData?.reject_note || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await onSubmit(formData)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save job'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
      <div className="grid gap-4 sm:gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-700">
            <Building2 className="h-4 w-4 text-indigo-500" /> Company Name
          </label>
          <input
            type="text"
            name="company_name"
            value={formData.company_name}
            onChange={handleChange}
            disabled={isDisabled}
            required
            placeholder="e.g. PT Contoh Tech"
            className={inputClass(isDisabled)}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-700">
            <Briefcase className="h-4 w-4 text-indigo-500" /> Position
          </label>
          <input
            type="text"
            name="position"
            value={formData.position}
            onChange={handleChange}
            disabled={isDisabled}
            required
            placeholder="e.g. Senior Frontend Engineer"
            className={inputClass(isDisabled)}
          />
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-700">
            <CalendarDays className="h-4 w-4 text-indigo-500" /> Apply Date
          </label>
          <input
            type="date"
            name="apply_date"
            value={formData.apply_date}
            onChange={handleChange}
            disabled={isDisabled}
            required
            className={inputClass(isDisabled)}
          />
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-700">
            <Briefcase className="h-4 w-4 text-indigo-500" /> Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            disabled={isDisabled}
            required
            className={inputClass(isDisabled)}
          >
            {STATUS_ORDER.map(s => (
              <option key={s} value={s}>
                {s.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-700">
            <AlignLeft className="h-4 w-4 text-indigo-500" /> Job Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            disabled={isDisabled}
            required
            rows={5}
            placeholder="Job description, requirements, notes, etc..."
            className={`${inputClass(isDisabled)} resize-y`}
          />
        </div>

        {formData.status === 'Reject' && (
          <div className="sm:col-span-2">
            <label className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-700">
              <AlignLeft className="h-4 w-4 text-rose-500" />
              <span className="text-rose-600">Reject Note</span>
              <span className="ml-1 rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] font-semibold text-rose-500">Optional</span>
            </label>
            <p className="mb-1.5 text-xs text-slate-400">Note the reason for rejection so you can use it as a reference.</p>
            <textarea
              name="reject_note"
              value={formData.reject_note}
              onChange={handleChange}
              disabled={isDisabled}
              rows={4}
              placeholder="e.g. Did not pass technical test, salary mismatch, etc..."
              className={`${inputClass(isDisabled)} resize-y border-rose-200 focus:border-rose-400 focus:ring-rose-100`}
            />
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs sm:text-sm font-medium text-rose-600">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end sm:gap-3 sm:pt-5">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl px-4 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-semibold text-slate-600 transition hover:bg-slate-100 order-2 sm:order-1"
        >
          {isDisabled ? 'Close' : 'Cancel'}
        </button>
        {!isDisabled && (
          <button
            type="submit"
            disabled={loading}
            className="order-1 sm:order-2 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 sm:px-6 sm:py-2.5 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        )}
      </div>
    </form>
  )
}