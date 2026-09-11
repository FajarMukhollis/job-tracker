export type JobStatus = 'Apply' | 'HR_Interview' | 'Test' | 'User_Interview' | 'Offering' | 'Gagal'

export const STATUS_META: Record<JobStatus, { label: string; badge: string; dot: string; chart: string; hex: string }> = {
  Apply: {
    label: 'Apply',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
    chart: 'bg-blue-500',
    hex: '#3b82f6',
  },
  HR_Interview: {
    label: 'HR Interview',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
    chart: 'bg-amber-500',
    hex: '#f59e0b',
  },
  Test: {
    label: 'Test',
    badge: 'bg-violet-50 text-violet-700 border-violet-200',
    dot: 'bg-violet-500',
    chart: 'bg-violet-500',
    hex: '#8b5cf6',
  },
  User_Interview: {
    label: 'User Interview',
    badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    dot: 'bg-indigo-500',
    chart: 'bg-indigo-500',
    hex: '#6366f1',
  },
  Offering: {
    label: 'Offering',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
    chart: 'bg-emerald-500',
    hex: '#10b981',
  },
  Gagal: {
    label: 'Gagal',
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-500',
    chart: 'bg-rose-500',
    hex: '#f43f5e',
  },
}

export const STATUS_ORDER: JobStatus[] = ['Apply', 'HR_Interview', 'Test', 'User_Interview', 'Offering', 'Gagal']

export function formatStatus(status: JobStatus) {
  return STATUS_META[status].label
}