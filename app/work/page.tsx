'use client'

import { useEffect, useMemo, useState } from 'react'
import { Plus, Search, Filter, Eye, Pencil, Trash2, CalendarDays, Building2, Loader2 } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import Modal from '@/components/Modal'
import JobForm from '@/components/JobForm'
import StatusBadge from '@/components/StatusBadge'
import EmptyState from '@/components/EmptyState'
import PageHeader from '@/components/PageHeader'
import { STATUS_ORDER, type JobStatus } from '@/lib/status'

interface Job {
  id: string
  company_name: string
  position: string
  apply_date: string
  status: JobStatus
  description: string
  created_at: string
  updated_at: string
}

const AVATAR_COLORS = [
  'from-indigo-500 to-violet-600',
  'from-sky-500 to-cyan-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-fuchsia-500 to-purple-600',
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

  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | JobStatus>('all')

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      setError(null)
      const res = await fetch('/api/jobs')
      if (!res.ok) throw new Error(`Failed to fetch jobs: ${res.status}`)
      const data = await res.json()
      setJobs(data)
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to fetch jobs'
      console.error('Failed to fetch jobs:', error)
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

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

  const handleDeleteJob = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/jobs/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to delete job')
      }
      setJobs(jobs.filter(job => job.id !== id))
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to delete job'
      console.error('Failed to delete job:', error)
      alert(errorMsg)
    } finally {
      setDeletingId(null)
    }
  }

  const handleFormSubmit = async (formData: any) => {
    try {
      const dateStr = formData.apply_date
      const [year, month, day] = dateStr.split('-')
      const isoDate = new Date(year, parseInt(month) - 1, day).toISOString()
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
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to save job'
      console.error('Failed to save job:', error)
      throw new Error(errorMsg)
    }
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setSelectedJob(null)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const modalTitle =
    modalMode === 'add'
      ? 'Add Job Application'
      : modalMode === 'view'
      ? 'Job Details'
      : 'Edit Job Application'

  const modalSubtitle =
    modalMode === 'add'
      ? 'Catat lowongan pekerjaan yang baru kamu lamar'
      : selectedJob
      ? `${selectedJob.company_name} — ${selectedJob.position}`
      : undefined

  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="ml-64 min-h-screen p-6 lg:p-8">
        <PageHeader
          title="Work"
          subtitle="Kelola seluruh lamaran pekerjaanmu dalam satu tempat"
          action={
            <button
              onClick={handleAddJob}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-700 hover:shadow-xl hover:shadow-emerald-500/30"
            >
              <Plus className="h-4 w-4" />
              Add Application
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
              placeholder="Cari perusahaan atau posisi..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as 'all' | JobStatus)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="all">Semua Status</option>
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
            <span className="ml-2 text-sm font-medium">Memuat data...</span>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
            <p className="font-semibold">Error loading jobs</p>
            <p className="mt-1 text-sm">{error}</p>
            <button
              onClick={() => fetchJobs()}
              className="mt-3 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
            >
              Try again
            </button>
          </div>
        ) : jobs.length === 0 ? (
          <EmptyState
            message="Belum ada lowongan yang kamu lamar. Mulai catat lamaran kerjamu sekarang."
            actionLabel="Tambah Lamaran"
            onAction={handleAddJob}
          />
        ) : filteredJobs.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <Search className="h-10 w-10 text-slate-300" />
            <p className="mt-4 text-sm font-medium text-slate-500">Tidak ada hasil yang cocok</p>
            <button onClick={() => { setSearch(''); setFilterStatus('all') }} className="mt-3 text-sm font-semibold text-indigo-600 hover:underline">
              Reset filter
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredJobs.map(job => (
              <div
                key={job.id}
                className="group flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100/50 sm:flex-row sm:items-center"
              >
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${avatarColor(job.company_name)} font-bold text-white`}>
                  {job.company_name.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold text-slate-900">{job.position}</h3>
                    {job.status === 'Offering' && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                        Success
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-500">
                    <Building2 className="h-3.5 w-3.5" />
                    {job.company_name}
                  </p>
                  <p className="mt-1 line-clamp-1 text-sm text-slate-400">{job.description}</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 sm:flex-col sm:items-end sm:gap-2">
                  <div className="flex items-center gap-3">
                    <StatusBadge status={job.status} size="sm" />
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {formatDate(job.apply_date)}
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