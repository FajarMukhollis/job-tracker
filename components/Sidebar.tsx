'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Briefcase, Activity } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/work', label: 'Work', icon: Briefcase },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col bg-slate-950 text-white">
      <div className="relative flex h-full flex-col overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950">
        <div className="pointer-events-none absolute -top-24 -right-16 h-48 w-48 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-48 w-48 rounded-full bg-violet-600/20 blur-3xl" />

        <div className="relative z-10 flex items-center gap-3 px-5 pt-6 pb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight">Job Tracker</h1>
            <p className="text-[11px] font-medium text-slate-400">Application Manager</p>
          </div>
        </div>

        <nav className="relative z-10 mt-2 flex-1 space-y-1 px-3">
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Menu
          </p>
          {navItems.map(item => {
            const active = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-900/40'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className={`h-[18px] w-[18px] ${active ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`} />
                {item.label}
                {active && <span className="absolute right-3 h-1.5 w-1.5 rounded-full bg-white/80" />}
              </Link>
            )
          })}
        </nav>

        <div className="relative z-10 mx-3 mb-5 rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-sm font-bold text-white">
              AK
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">Applicant</p>
              <p className="truncate text-[11px] text-slate-400">Job seeker</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}