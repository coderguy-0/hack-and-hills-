import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Target as TargetIcon, Activity, FileText, Library, ShieldCheck,
  Mountain, LogOut, Search, Bell, Menu, X, User, Settings, Sparkles
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../store/auth'

const nav = [
  { icon: LayoutDashboard, label: 'Overview', path: '/dashboard' },
  { icon: TargetIcon, label: 'Base Camp', sub: 'Targets', path: '/dashboard/targets' },
  { icon: Activity, label: 'The Ascent', sub: 'Evaluations', path: '/dashboard/evaluations' },
  { icon: ShieldCheck, label: 'Findings', path: '/dashboard/findings' },
  { icon: Library, label: 'Test Library', path: '/dashboard/library' },
  { icon: FileText, label: 'Reports', path: '/dashboard/reports' },
]

export function Topbar() {
  const { user, logout } = useAuth()
  const nav_ = useNavigate()
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-40 glass-strong border-b border-white/[0.06]">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between px-4 md:px-6 h-[64px]">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center glow-amber">
            <Mountain className="w-5 h-5 text-black" />
          </div>
          <div className="leading-tight">
            <div className="font-display font-bold text-[15px] tracking-tight">INVICTUS</div>
            <div className="text-[10px] tracking-[0.18em] text-white/50 font-medium">AI SAFETY EVALUATOR</div>
          </div>
          <span className="hidden md:inline-flex ml-2 text-[10px] px-2 py-1 rounded-full bg-white/10 border border-white/10">v1.0 • PRIVATE BETA</span>
        </Link>

        <div className="hidden md:flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-full bg-white/[0.06] border border-white/10">
            <div className="flex items-center gap-2 pl-3 pr-2 py-1 text-sm text-white/70"><Search className="w-4 h-4" /> Search evaluations...</div>
            <span className="text-[10px] px-2 py-1 rounded-full bg-white text-black font-medium">⌘K</span>
          </div>
          <button className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/10 grid place-items-center text-white/70"><Bell className="w-4 h-4" /></button>
          {user ? (
            <div className="flex items-center gap-3 ml-2">
              <div className="hidden lg:block text-right leading-tight">
                <div className="text-sm font-medium">{user.name}</div>
                <div className="text-xs text-white/50">{user.email}</div>
              </div>
              <img src={`https://i.pravatar.cc/100?u=${user.email}`} className="w-9 h-9 rounded-full border border-white/20" />
              <button onClick={() => { logout(); nav_('/login') }} className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/10 grid place-items-center"><LogOut className="w-4 h-4" /></button>
            </div>
          ) : (
            <Link to="/login" className="ml-2 px-5 py-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-black text-sm font-semibold">Sign in</Link>
          )}
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden w-9 h-9 rounded-xl bg-white/10 grid place-items-center">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-white/10 p-4 space-y-3 bg-[#0B1222]">
          {nav.map(n => <Link key={n.path} to={n.path} onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/[0.04]">{<n.icon className="w-4 h-4" />} {n.label}</Link>)}
        </div>
      )}
    </header>
  )
}

export function Sidebar() {
  const loc = useLocation()
  return (
    <aside className="hidden lg:flex w-[264px] shrink-0 flex-col sticky top-[64px] h-[calc(100vh-64px)] border-r border-white/[0.06] bg-[#0A0F1E]/60 backdrop-blur-xl">
      <div className="p-4 space-y-1 flex-1 overflow-y-auto">
        <div className="px-3 py-3 rounded-2xl bg-gradient-to-br from-amber-500/15 to-orange-500/10 border border-amber-500/20 mb-4">
          <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold tracking-wide"><Sparkles className="w-3.5 h-3.5" /> MISSION CONTROL</div>
          <div className="font-display font-bold mt-1">Every test is a climb toward trust.</div>
          <div className="text-xs text-white/60 mt-1">Red vs Blue • Evidence-backed • Auditable</div>
        </div>
        {nav.map(item => {
          const active = loc.pathname === item.path || (item.path !== '/dashboard' && loc.pathname.startsWith(item.path))
          return (
            <Link key={item.path} to={item.path} className={`flex items-center gap-3 px-3 py-3 rounded-xl transition ${active ? 'bg-white text-black' : 'text-white/70 hover:bg-white/[0.06] hover:text-white'}`}>
              <item.icon className={`w-[18px] h-[18px] ${active ? 'text-black' : 'text-white/60'}`} />
              <div className="leading-tight">
                <div className={`text-sm font-medium ${active ? 'text-black' : 'text-white'}`}>{item.label}</div>
                {item.sub && <div className={`text-xs ${active ? 'text-black/60' : 'text-white/50'}`}>{item.sub}</div>}
              </div>
              {item.label === 'The Ascent' && <span className="ml-auto w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
            </Link>
          )
        })}
      </div>
      <div className="p-4 border-t border-white/10">
        <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-3">
          <div className="flex items-center gap-2 text-xs text-white/60"><ShieldCheck className="w-3.5 h-3.5" /> Trusted Environment</div>
          <div className="text-xs text-white/40 mt-1">Isolated Red/Blue workers • Private network • Audit integrity</div>
          <div className="mt-3 flex gap-2">
            <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">● Red worker online</span>
            <span className="text-[10px] px-2 py-1 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/20">● Blue worker online</span>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-white/40">
          <span>© 2025 Invictus Labs</span><span className="flex items-center gap-1"><Settings className="w-3 h-3" /> v1.0.4</span>
        </div>
      </div>
    </aside>
  )
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen mesh-bg">
      <Topbar />
      <div className="max-w-[1600px] mx-auto flex">
        <Sidebar />
        <main className="flex-1 min-w-0">
          <div className="p-4 md:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
