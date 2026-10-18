import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { api, Stats } from '../lib/api'
import { Mountain, Target, Activity, ShieldAlert, TrendingUp, ArrowUpRight, Clock, CheckCircle2, AlertCircle, Eye, Play } from 'lucide-react'
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar, Cell } from 'recharts'

export default function Overview() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  useEffect(() => {
    api.get('/api/stats').then(r => setStats(r.data)).catch(e => setErr(e.response?.data?.detail || e.message)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="min-h-[40vh] grid place-items-center text-white/60">Loading mission control…</div>
  if (err) return <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-6 text-red-300">Failed to load stats: {err} — <Link to="/login" className="underline">Sign in</Link></div>
  if (!stats) return null

  const sevData = Object.entries(stats.findings_by_severity).map(([name, value]) => ({ name, value }))
  const sevColors: Record<string, string> = { critical: '#EF4444', high: '#F59E0B', medium: '#38BDF8', low: '#10B981', info: '#64748B' }

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs">
            <span className="px-3 py-1 rounded-full bg-white text-black font-semibold">MISSION CONTROL</span>
            <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-white/60">Last sync just now • All systems nominal</span>
          </div>
          <h1 className="font-display text-[28px] md:text-[32px] font-bold tracking-tight mt-3">Good morning, Alex. <span className="text-white/50">Your summit is in sight.</span></h1>
          <p className="text-white/60 mt-1">Track every ascent — Red vs Blue, evidence-backed, auditable.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/dashboard/targets" className="px-4 py-2.5 rounded-full bg-white text-black text-sm font-semibold inline-flex items-center gap-2">New target <Target className="w-4 h-4" /></Link>
          <Link to="/dashboard/evaluations" className="px-4 py-2.5 rounded-full bg-amber-500 text-black text-sm font-semibold inline-flex items-center gap-2">Run evaluation <Play className="w-4 h-4" /></Link>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total targets', value: stats.total_targets, sub: '3 types • verified', icon: Target, tone: 'bg-white text-black' },
          { label: 'Evaluations', value: stats.total_evaluations, sub: `${stats.completed_evaluations} completed • ${stats.running_evaluations} running`, icon: Activity, tone: 'bg-amber-500 text-black' },
          { label: 'Avg. safety score', value: `${stats.avg_score}`, sub: `Red ${stats.red_pass_rate}% • Blue ${stats.blue_pass_rate}%`, icon: TrendingUp, tone: 'bg-sky-400 text-black' },
          { label: 'Critical findings', value: stats.critical_findings, sub: 'Requires attention', icon: ShieldAlert, tone: 'bg-red-500 text-white' },
        ].map(c => (
          <div key={c.label} className="rounded-[20px] bg-white/[0.06] border border-white/10 p-5 hover:bg-white/[0.08] transition">
            <div className="flex items-start justify-between">
              <div className={`w-10 h-10 rounded-xl grid place-items-center ${c.tone}`}><c.icon className="w-5 h-5" /></div>
              <span className="text-xs px-2 py-1 rounded-full bg-white/10 border border-white/10 text-white/60">Live</span>
            </div>
            <div className="text-3xl font-bold mt-4">{c.value}</div>
            <div className="text-xs text-white/50 mt-1">{c.label}</div>
            <div className="text-xs text-white/40 mt-1">{c.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1.6fr_0.9fr] gap-4">
        {/* trend */}
        <div className="rounded-[20px] bg-white p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-black">Safety trend — last 7 evaluations</h3>
            <span className="text-xs px-2.5 py-1 rounded-full bg-black text-white">Score / 100</span>
          </div>
          <div className="h-[220px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.trend}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis domain={[40, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} width={32} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0' }} />
                <Area type="monotone" dataKey="score" stroke="#F59E0B" strokeWidth={2.5} fill="url(#g1)" dot={{ r: 4, fill: '#F59E0B', stroke: 'white', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">↑ Pass rate improving</span>
            <span className="px-2.5 py-1 rounded-full bg-slate-100">7 pts • avg {stats.avg_score}</span>
          </div>
        </div>

        {/* severity */}
        <div className="rounded-[20px] bg-[#0B1222] border border-white/10 p-6">
          <h3 className="font-display font-bold">Findings by severity</h3>
          <div className="h-[180px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sevData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }} width={64} />
                <Tooltip contentStyle={{ borderRadius: 12, background: '#0B1222', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={18}>
                  {sevData.map((d, i) => <Cell key={i} fill={sevColors[d.name] || '#64748B'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
            {sevData.map(d => (
              <div key={d.name} className="rounded-xl bg-white/[0.06] border border-white/10 p-2.5 text-center">
                <div className="font-bold capitalize" style={{ color: sevColors[d.name] }}>{d.name}</div>
                <div className="text-white/60">{d.value} open</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.6fr_0.9fr] gap-4">
        {/* recent evals */}
        <div className="rounded-[20px] bg-white/[0.06] border border-white/10 overflow-hidden">
          <div className="p-5 flex items-center justify-between border-b border-white/10">
            <h3 className="font-display font-bold">Recent evaluations</h3>
            <Link to="/dashboard/evaluations" className="text-xs px-3 py-1.5 rounded-full bg-white text-black font-medium inline-flex items-center gap-1">View all <ArrowUpRight className="w-3 h-3" /></Link>
          </div>
          <div className="divide-y divide-white/10">
            {stats.recent_evaluations.map(ev => (
              <Link key={ev.id} to={`/dashboard/evaluations/${ev.id}`} className="flex items-center gap-4 p-4 hover:bg-white/[0.04] transition">
                <div className={`w-10 h-10 rounded-xl grid place-items-center text-white ${ev.status === 'completed' ? 'bg-emerald-500' : ev.status === 'running' ? 'bg-amber-500 animate-pulse' : 'bg-slate-600'}`}>
                  {ev.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : ev.status === 'running' ? <Clock className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{ev.name}</div>
                  <div className="text-xs text-white/50 truncate">{ev.id} • {new Date(ev.created_at).toLocaleString()} • {ev.status}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{ev.score || '—'}</div>
                  <div className="text-xs text-white/50">score</div>
                </div>
                <div className={`text-xs px-2.5 py-1 rounded-full border ${ev.status === 'completed' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20' : 'bg-amber-500/15 text-amber-300 border-amber-500/20'}`}>{ev.status}</div>
              </Link>
            ))}
            {stats.recent_evaluations.length === 0 && <div className="p-8 text-center text-white/50">No evaluations yet — start your first ascent.</div>}
          </div>
        </div>

        {/* How it works */}
        <div className="rounded-[20px] bg-white p-6 text-black">
          <h3 className="font-display font-bold flex items-center gap-2"><Mountain className="w-4 h-4" /> How Invictus works</h3>
          <div className="mt-4 space-y-3">
            {[
              { n: 'Base Camp', d: 'Register target → configure scope → verify connectivity', c: 'bg-black text-white' },
              { n: 'The Ascent', d: 'Red & Blue routes run in isolated workers; watch live', c: 'bg-amber-500 text-black' },
              { n: 'The Summit', d: 'Inspect findings, evidence, and export the report', c: 'bg-sky-500 text-white' },
            ].map(s => (
              <div key={s.n} className="flex gap-3">
                <span className={`w-8 h-8 rounded-full grid place-items-center text-xs font-bold shrink-0 ${s.c}`}>✓</span>
                <div><div className="font-semibold text-sm">{s.n}</div><div className="text-xs text-black/60">{s.d}</div></div>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-xl bg-black text-white p-4 flex items-center justify-between">
            <div><div className="font-semibold text-sm">Ready to run an evaluation?</div><div className="text-xs text-white/60">Takes ~30 seconds end-to-end</div></div>
            <Link to="/dashboard/targets" className="px-4 py-2 rounded-full bg-white text-black text-sm font-semibold">Go →</Link>
          </div>
        </div>
      </div>

      {/* bottom strip */}
      <div className="rounded-[20px] bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 p-[1px]">
        <div className="rounded-[19px] bg-[#0B1222] p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-sm"><Eye className="w-4 h-4 text-amber-400" /> <span className="font-medium">All evaluations are evidence-backed and audit-logged.</span> <span className="text-white/50 hidden md:inline">Click any checkpoint to view request/response/logs/metrics.</span></div>
          <Link to="/dashboard/evaluations" className="px-4 py-2 rounded-full bg-white text-black text-sm font-semibold">Open live view</Link>
        </div>
      </div>
    </div>
  )
}
