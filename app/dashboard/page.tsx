'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Briefcase,
  Send,
  Users,
  FileCheck,
  Mic,
  Trophy,
  XCircle,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Loader2,
} from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import PageHeader from '@/components/PageHeader'
import { STATUS_META, STATUS_ORDER, type JobStatus } from '@/lib/status'

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

interface StatCards {
  total: number
  apply: number
  hr_interview: number
  test: number
  user_interview: number
  offering: number
  rejected: number
}

const CARD_DEFS: { key: keyof StatCards; label: string; icon: any; color: string; iconBg: string }[] = [
  { key: 'total', label: 'Total Applications', icon: Briefcase, color: 'bg-slate-900', iconBg: 'bg-white/20' },
  { key: 'apply', label: 'Apply', icon: Send, color: 'bg-blue-600', iconBg: 'bg-white/20' },
  { key: 'hr_interview', label: 'HR Interview', icon: Users, color: 'bg-amber-500', iconBg: 'bg-white/20' },
  { key: 'test', label: 'Test', icon: FileCheck, color: 'bg-violet-600', iconBg: 'bg-white/20' },
  { key: 'user_interview', label: 'User Interview', icon: Mic, color: 'bg-indigo-600', iconBg: 'bg-white/20' },
  { key: 'offering', label: 'Offering', icon: Trophy, color: 'bg-emerald-600', iconBg: 'bg-white/20' },
  { key: 'rejected', label: 'Reject', icon: XCircle, color: 'bg-rose-500', iconBg: 'bg-white/20' },
]

function DonutChart({ data }: { data: { label: string; value: number; hex: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  const radius = 54
  const circumference = 2 * Math.PI * radius
  let offset = 0

  if (total === 0) {
    return (
      <svg viewBox="0 0 128 128" className="h-40 w-40 -rotate-90">
        <circle cx="64" cy="64" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="14" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 128 128" className="h-40 w-40 -rotate-90">
      <circle cx="64" cy="64" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="14" />
      {data.map((d, i) => {
        if (d.value === 0) return null
        const dash = (d.value / total) * circumference
        const seg = (
          <circle
            key={i}
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke={d.hex}
            strokeWidth="14"
            strokeDasharray={`${dash} ${circumference - dash}`}
            strokeDashoffset={-offset}
            strokeLinecap="butt"
          />
        )
        offset += dash
        return seg
      })}
    </svg>
  )
}

function ProgressRing({ value, color, label }: { value: number; color: string; label: string }) {
  const radius = 50
  const circumference = 2 * Math.PI * radius
  const dash = (value / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-32 w-32">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="12" />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeDasharray={`${dash} ${circumference - dash}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-slate-900">{value}%</span>
        </div>
      </div>
      <span className="mt-2 text-sm font-medium text-slate-500">{label}</span>
    </div>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState<StatCards | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setError(null)
      const res = await fetch('/api/jobs')
      if (!res.ok) throw new Error(`Failed to fetch stats: ${res.status}`)
      const data: Job[] = await res.json()
      setJobs(data)
      setStats({
        total: data.length,
        apply: data.filter(j => j.status === 'Apply').length,
        hr_interview: data.filter(j => j.status === 'HR_Interview').length,
        test: data.filter(j => j.status === 'Test').length,
        user_interview: data.filter(j => j.status === 'User_Interview').length,
        offering: data.filter(j => j.status === 'Offering').length,
        rejected: data.filter(j => j.status === 'Reject').length,
      })
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to fetch stats'
      console.error('Failed to fetch stats:', error)
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const donutData = useMemo(() => {
    if (!stats) return []
    return STATUS_ORDER.filter(s => s !== 'Offering' && s !== 'Reject').map(s => ({
      label: STATUS_META[s].label,
      value: stats[s === 'Apply' ? 'apply' : s === 'HR_Interview' ? 'hr_interview' : s === 'Test' ? 'test' : 'user_interview'],
      hex: STATUS_META[s].hex,
    }))
  }, [stats])

  const distribution = useMemo(() => {
    if (!stats) return []
    return STATUS_ORDER.map(s => ({
      status: s,
      count: stats[s === 'Apply' ? 'apply' : s === 'HR_Interview' ? 'hr_interview' : s === 'Test' ? 'test' : s === 'User_Interview' ? 'user_interview' : s === 'Offering' ? 'offering' : 'rejected'],
    }))
  }, [stats])

  const maxCount = useMemo(() => {
    if (!distribution.length) return 0
    return Math.max(...distribution.map(d => d.count))
  }, [distribution])

  const successRate = stats && stats.total > 0 ? Math.round((stats.offering / stats.total) * 100) : 0
  const failureRate = stats && stats.total > 0 ? Math.round((stats.rejected / stats.total) * 100) : 0
  const activeRate = stats && stats.total > 0 ? Math.round(((stats.total - stats.offering - stats.rejected) / stats.total) * 100) : 0

  const recentJobs = [...jobs]
    .sort((a, b) => new Date(b.apply_date).getTime() - new Date(a.apply_date).getTime())
    .slice(0, 5)

  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="ml-64 min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 p-6 lg:p-8">
        <PageHeader
          title="Dashboard"
          subtitle="Ringkasan progres lamaran kerjamu"
          action={
            <a
              href="/work"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-300 hover:text-indigo-600"
            >
              Lihat Work
              <ArrowRight className="h-4 w-4" />
            </a>
          }
        />

        {loading ? (
          <div className="flex items-center justify-center py-24 text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2 text-sm font-medium">Memuat data...</span>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
            <p className="font-semibold">Error loading dashboard</p>
            <p className="mt-1 text-sm">{error}</p>
            <button
              onClick={() => fetchStats()}
              className="mt-3 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
            >
              Try again
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {CARD_DEFS.slice(0, 4).map(ctx => {
                const Icon = ctx.icon
                const value = stats?.[ctx.key] ?? 0
                return (
                  <div
                    key={ctx.key}
                    className={`relative overflow-hidden rounded-2xl ${ctx.color} p-5 text-white shadow-lg transition-transform duration-200 hover:-translate-y-1`}
                  >
                    <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-xl" />
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-medium text-white/80">{ctx.label}</p>
                        <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
                      </div>
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${ctx.iconBg} backdrop-blur-sm`}>
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              {/* Donut chart */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-base font-bold text-slate-900">Pipeline Distribution</h2>
                <p className="text-xs text-slate-400">Penyebaran status lamaran aktif</p>
                <div className="mt-6 flex items-center justify-center">
                  <div className="relative">
                    <DonutChart data={donutData} />
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-slate-900">{stats?.total ?? 0}</span>
                      <span className="text-[11px] font-medium text-slate-400">Total</span>
                    </div>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-2">
                  {donutData.map(d => (
                    <div key={d.label} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.hex }} />
                      <span className="text-xs font-medium text-slate-600">{d.label}</span>
                      <span className="ml-auto text-xs font-bold text-slate-900">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Distribution bars */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-base font-bold text-slate-900">Status Distribution</h2>
                <p className="text-xs text-slate-400">Jumlah lamaran per status</p>
                <div className="mt-6 space-y-4">
                  {distribution.map(({ status, count }) => {
                    const meta = STATUS_META[status]
                    const pct = maxCount > 0 ? Math.round((count / maxCount) * 100) : 0
                    return (
                      <div key={status}>
                        <div className="mb-1.5 flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-600">{meta.label}</span>
                          <span className="text-sm font-bold text-slate-900">{count}</span>
                        </div>
                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full ${meta.chart} transition-all duration-700`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Success metrics */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-base font-bold text-slate-900">Success Rate</h2>
                <p className="text-xs text-slate-400">Perbandingan hasil lamaran</p>
                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div className="flex flex-col items-center rounded-xl bg-emerald-50 px-2 py-4">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                    </span>
                    <span className="mt-2 text-xl font-bold text-emerald-700">{successRate}%</span>
                    <span className="text-[11px] font-medium text-emerald-600">Offering</span>
                  </div>
                  <div className="flex flex-col items-center rounded-xl bg-rose-50 px-2 py-4">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100">
                      <TrendingDown className="h-4 w-4 text-rose-600" />
                    </span>
                    <span className="mt-2 text-xl font-bold text-rose-700">{failureRate}%</span>
                    <span className="text-[11px] font-medium text-rose-600">Reject</span>
                  </div>
                  <div className="flex flex-col items-center rounded-xl bg-indigo-50 px-2 py-4">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100">
                      <Briefcase className="h-4 w-4 text-indigo-600" />
                    </span>
                    <span className="mt-2 text-xl font-bold text-indigo-700">{activeRate}%</span>
                    <span className="text-[11px] font-medium text-indigo-600">Aktif</span>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-slate-700">Lamaran Terbaru</h3>
                  <div className="mt-3 space-y-2">
                    {recentJobs.length === 0 ? (
                      <p className="text-sm text-slate-400">Belum ada lamaran.</p>
                    ) : (
                      recentJobs.map(job => (
                        <a
                          key={job.id}
                          href="/work"
                          className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2.5 transition hover:border-indigo-200 hover:bg-indigo-50/40"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-800">{job.position}</p>
                            <p className="truncate text-xs text-slate-400">{job.company_name}</p>
                          </div>
                          <span className={`h-2 w-2 shrink-0 rounded-full ${STATUS_META[job.status].dot}`} />
                        </a>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {CARD_DEFS.slice(4).map(ctx => {
                const Icon = ctx.icon
                const value = stats?.[ctx.key] ?? 0
                return (
                  <div
                    key={ctx.key}
                    className={`relative flex items-center gap-4 overflow-hidden rounded-2xl ${ctx.color} p-4 text-white shadow-md transition-transform duration-200 hover:-translate-y-0.5`}
                  >
                    <div className="pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full bg-white/10 blur-lg" />
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${ctx.iconBg}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold leading-none tracking-tight">{value}</p>
                      <p className="mt-1 text-xs font-medium text-white/80">{ctx.label}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </main>
    </div>
  )
}