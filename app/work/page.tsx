'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, Search, Filter, Eye, Pencil, Trash2, CalendarDays, Building2, Loader2 } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import Modal from '@/components/Modal'
import StatusBadge from '@/components/StatusBadge'
import EmptyState from '@/components/EmptyState'
import PageHeader from '@/components/PageHeader'
import ToastContainer, { type ToastItem } from '@/components/Toast'
import ConfirmDialog from '@/components/ConfirmDialog'
import { STATUS_ORDER, type JobStatus } from '@/lib/status'
import JobForm, { type JobFormData } from '@/components/JobForm'

interface Job {
  id: string
  company_name: string
  position: string
  apply_date: string
  status: JobStatus
  description: string
  reject_note?: string | null
  created_at: string
  updated_at: string
}

const AVATAR_COLORS = [
  'bg-indigo-500',
  'bg-sky-600',
  'bg-emerald-600',
  'bg-amber-500',
  'bg-rose-500',
  'bg-fuchsia-600',
]

function avatarColor(key: string) {
  let hash = 0
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) % AVATAR_COLORS.length
  return AVATAR_COLORS[hash]
}

export default function WorkPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'add' | 'view' | 'edit'>('add')
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const [reloadKey, setReloadKey] = useState(0)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | JobStatus>('all')

  // Helper untuk menambahkan toast notifikasi
  const addToast = useCallback((type: ToastItem['type'], message: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`
    setToasts(prev => [...prev, { id, type, message }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const res = await fetch('/api/jobs')
        if (!res.ok) throw new Error(`Failed to fetch jobs: ${res.status}`)
        const data = await res.json()
        if (cancelled) return
        setJobs(data)
      } catch (error) {
        if (cancelled) return
        const errorMsg = error instanceof Error ? error.message : 'Failed to fetch jobs'
        console.error('Failed to fetch jobs:', error)
        setError(errorMsg)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [reloadKey])

  const filteredJobs = useMemo(() => {
    const q = search.trim().toLowerCase()
    return jobs.filter(job => {
      const matchStatus = filterStatus === 'all' || job.status === filterStatus
      const matchSearch =
        !q ||
        job.company_name.toLowerCase().includes(q) ||
        job.position.toLowerCase().includes(q)
      return matchStatus && matchSearch
    })
  }, [jobs, search, filterStatus])

  const handleAddJob = () => {
    setModalMode('add')
    setSelectedJob(null)
    setModalOpen(true)
  }

  const handleViewJob = (job: Job) => {
    setModalMode('view')
    setSelectedJob(job)
    setModalOpen(true)
  }

  const handleEditJob = (job: Job) => {
    setModalMode('edit')
    setSelectedJob(job)
    setModalOpen(true)
  }

  const handleDeleteJob = (id: string) => {
    setConfirmId(id)
  }

  const confirmDelete = async () => {
    if (!confirmId) return
    const id = confirmId
    setDeletingId(id)
    setConfirmId(null)
    try {
      const res = await fetch(`/api/jobs/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to delete job')
      }
      setJobs(jobs.filter(job => job.id !== id))
      addToast('success', 'Application deleted successfully.')
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to delete job'
      console.error('Failed to delete job:', error)
      addToast('error', errorMsg)
    } finally {
      setDeletingId(null)
    }
  }

  const handleFormSubmit = async (formData: JobFormData) => {
    try {
      const dateStr = formData.apply_date as string
      const [year, month, day] = dateStr.split('-')
      const isoDate = new Date(Date.UTC(Number(year), parseInt(month) - 1, Number(day))).toISOString()
      const payload = { ...formData, apply_date: isoDate }

      if (modalMode === 'add') {
        const res = await fetch('/api/jobs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          const errData = await res.json()
          throw new Error(errData.error || 'Failed to create job')
        }
        const newJob = await res.json()
        setJobs([newJob, ...jobs])
        setModalOpen(false)
        addToast('success', 'Job application added successfully!')
      } else if (modalMode === 'edit' && selectedJob) {
        const res = await fetch(`/api/jobs/${selectedJob.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          const errData = await res.json()
          throw new Error(errData.error || 'Failed to update job')
        }
        const updatedJob = await res.json()
        setJobs(jobs.map(job => (job.id === selectedJob.id ? updatedJob : job)))
        setModalOpen(false)
        addToast('success', 'Job application updated successfully!')
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to save job'
      console.error('Failed to save job:', error)
      addToast('error', errorMsg)
      throw new Error(errorMsg)
    }
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setSelectedJob(null)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const modalTitle =
    modalMode === 'add'
      ? 'Add Job Application'
      : modalMode === 'view'
        ? 'Job Details'
        : 'Edit Job Application'

  const modalSubtitle =
    modalMode === 'add'
      ? 'Track a new job you just applied to'
      : selectedJob
        ? `${selectedJob.company_name} — ${selectedJob.position}`
        : undefined

  return (
    <div className="min-h-screen">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <ConfirmDialog
        isOpen={confirmId !== null}
        title="Delete Application"
        description="This action cannot be undone. The job application will be permanently removed."
        confirmLabel="Yes, Delete"
        cancelLabel="Cancel"
        isLoading={deletingId !== null}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmId(null)}
      />
      <Sidebar />
      <main className="min-h-screen p-4 md:ml-64 md:p-6 lg:p-8">
        <PageHeader
          title="Work"
          subtitle="Manage all your job applications in one place"
          action={
            <button
              onClick={handleAddJob}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-700 hover:shadow-xl hover:shadow-emerald-500/30 sm:w-auto sm:px-5 sm:py-2.5"
            >
              <Plus className="h-4 w-4" />
              <span className="sm:inline">Add Application</span>
            </button>
          }
        />

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search company or position..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-3 text-xs sm:py-2.5 sm:text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as 'all' | JobStatus)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:py-2.5 sm:text-sm font-medium text-slate-700 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="all">All Status</option>
              {STATUS_ORDER.map(s => (
                <option key={s} value={s}>
                  {s.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24 text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2 text-sm font-medium">Loading data...</span>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
            <p className="font-semibold">Error loading jobs</p>
            <p className="mt-1 text-sm">{error}</p>
            <button
              onClick={() => {
                setError(null)
                setLoading(true)
                setReloadKey(k => k + 1)
              }}
              className="mt-3 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
            >
              Try again
            </button>
          </div>
        ) : jobs.length === 0 ? (
          <EmptyState
            message="You haven't applied to any jobs yet. Start tracking your applications now."
            actionLabel="Add Application"
            onAction={handleAddJob}
          />
        ) : filteredJobs.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <Search className="h-10 w-10 text-slate-300" />
            <p className="mt-4 text-sm font-medium text-slate-500">No results found</p>
            <button onClick={() => { setSearch(''); setFilterStatus('all') }} className="mt-3 text-sm font-semibold text-indigo-600 hover:underline">
              Reset filter
            </button>
          </div>
        ) : (
          <div className="grid gap-3 sm:gap-4">
            {filteredJobs.map(job => (
              <div
                key={job.id}
                className="group flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100/50 sm:flex-row sm:items-center sm:gap-4 sm:p-5"
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${avatarColor(job.company_name)} font-bold text-white text-xs sm:h-12 sm:w-12`}>
                  {job.company_name.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-900 sm:text-base">{job.position}</h3>
                    {job.status === 'Offering' && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                        Success
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs sm:text-sm text-slate-500">
                    <Building2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    {job.company_name}
                  </p>
                  <p className="mt-1 line-clamp-1 text-xs sm:text-sm text-slate-400">{job.description}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end sm:gap-2">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <StatusBadge status={job.status} size="sm" />
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <CalendarDays className="h-3 w-3" />
                      <span className="hidden sm:inline">{formatDate(job.apply_date)}</span>
                      <span className="sm:hidden">{new Date(job.apply_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleViewJob(job)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-600"
                      title="View"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEditJob(job)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-amber-50 hover:text-amber-600"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteJob(job.id)}
                      disabled={deletingId === job.id}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                      title="Delete"
                    >
                      {deletingId === job.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Modal
          isOpen={modalOpen}
          title={modalTitle}
          subtitle={modalSubtitle}
          onClose={handleCloseModal}
        >
          {selectedJob || modalMode === 'add' ? (
            <JobForm
              initialData={
                selectedJob
                  ? {
                    ...selectedJob,
                    apply_date: selectedJob.apply_date.split('T')[0],
                  }
                  : undefined
              }
              onSubmit={handleFormSubmit}
              onCancel={handleCloseModal}
              isDisabled={modalMode === 'view'}
            />
          ) : null}
        </Modal>
      </main>
    </div>
  )
}