'use client'

import { useState } from 'react'
import { Building2, Briefcase, CalendarDays, AlignLeft, Check, Loader2 } from 'lucide-react'
import { STATUS_ORDER, type JobStatus } from '@/lib/status'

interface JobFormProps {
  initialData?: {
    id?: string
    company_name: string
    position: string
    apply_date: string
    status: JobStatus
    description: string
  }
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
  isDisabled?: boolean
}

const inputClass = (disabled: boolean) =>
  `mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none ${
    disabled ? 'cursor-not-allowed bg-slate-50 text-slate-500' : ''
  }`

export default function JobForm({ initialData, onSubmit, onCancel, isDisabled = false }: JobFormProps) {
  const [formData, setFormData] = useState({
    company_name: initialData?.company_name || '',
    position: initialData?.position || '',
    apply_date: initialData?.apply_date || '',
    status: (initialData?.status || 'Apply') as JobStatus,
    description: initialData?.description || '',
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
    } catch (err: any) {
      setError(err.message || 'Failed to save job')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
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
          <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
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
          <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
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
          <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
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
          <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
            <AlignLeft className="h-4 w-4 text-indigo-500" /> Job Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            disabled={isDisabled}
            required
            rows={7}
            placeholder="Deskripsi pekerjaan, requirements, notes, dll..."
            className={`${inputClass(isDisabled)} resize-y`}
          />
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
        >
          {isDisabled ? 'Close' : 'Cancel'}
        </button>
        {!isDisabled && (
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:opacity-95 disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        )}
      </div>
    </form>
  )
}