import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api, Evaluation, Target } from '../lib/api'
import { Activity, Clock, CheckCircle2, Plus, Search, Filter, Play, Eye, ArrowRight, Target as TargetIcon } from 'lucide-react'

export default function EvaluationsPage() {
  const [evals, setEvals] = useState<Evaluation[]>([])
  const [targets, setTargets] = useState<Target[]>([])
  const [q, setQ] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({ target_id: '', name: '' })
  const [busy, setBusy] = useState(false)
  const [params] = useSearchParams()

  const load = async () => {
    const [e, t] = await Promise.all([api.get('/api/evaluations'), api.get('/api/targets')])
    setEvals(e.data); setTargets(t.data)
    if (params.get('target') && !form.target_id) setForm(f => ({ ...f, target_id: params.get('target')! }))
  }
  useEffect(() => { load(); const id = setInterval(load, 3000); return () => clearInterval(id) }, [])

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.target_id) return
    setBusy(true)
    try {
      const { data } = await api.post('/api/evaluations', { target_id: form.target_id, name: form.name || undefined })
      setShowNew(false)
      window.location.href = `/dashboard/evaluations/${data.id}`
    } finally { setBusy(false) }
  }

  const filtered = evals.filter(ev => (ev.name + ev.id + ev.status).toLowerCase().includes(q.toLowerCase()))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs"><span className="px-3 py-1 rounded-full bg-sky-500 text-white font-semibold">THE ASCENT</span><span className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-white/60">Red vs Blue • Live evidence</span></div>
          <h1 className="font-display text-[30px] font-bold mt-3">The Ascent — Evaluations</h1>
          <p className="text-white/60">Every run streams checkpoints. Click any evaluation to inspect evidence.</p>
        </div>
        <button onClick={() => setShowNew(true)} className="px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-black font-semibold inline-flex items-center gap-2">New evaluation <Plus className="w-4 h-4" /></button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/[0.06] border border-white/10 flex-1 max-w-[420px]">
          <Search className="w-4 h-4 text-white/50" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search evaluations..." className="flex-1 bg-transparent outline-none text-sm placeholder:text-white/40" />
        </div>
        <div className="ml-auto text-xs text-white/50 self-center">{filtered.length} evaluations • live updates every 3s</div>
      </div>

      <div className="rounded-[20px] bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs tracking-widest text-black/50 bg-black/[0.04]">
              <tr>
                <th className="text-left px-5 py-3">EVALUATION</th>
                <th className="text-left px-3 py-3">TARGET</th>
                <th className="text-left px-3 py-3">STATUS</th>
                <th className="text-left px-3 py-3">PROGRESS</th>
                <th className="text-left px-3 py-3">SCORE</th>
                <th className="text-left px-3 py-3">RED / BLUE</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10">
              {filtered.map(ev => {
                const target = targets.find(t => t.id === ev.target_id)
                return (
                  <tr key={ev.id} className="hover:bg-black/[0.03]">
                    <td className="px-5 py-4">
                      <div className="font-semibold leading-tight">{ev.name}</div>
                      <div className="text-xs text-black/50">{ev.id} • {new Date(ev.created_at).toLocaleString()}</div>
                    </td>
                    <td className="px-3 py-4">
                      <div className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-black text-white"><TargetIcon className="w-3 h-3" /> {target?.name || ev.target_id}</div>
                      <div className="text-xs text-black/50 mt-1">{target?.type}</div>
                    </td>
                    <td className="px-3 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${ev.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ev.status === 'running' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-100 border-slate-200'}`}>
                        {ev.status === 'running' ? '● running' : ev.status === 'completed' ? '✓ completed' : ev.status}
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      <div className="w-[120px]">
                        <div className="h-1.5 rounded-full bg-black/10 overflow-hidden"><div className="h-full bg-black transition-all" style={{ width: `${ev.progress}%` }} /></div>
                        <div className="text-xs text-black/50 mt-1">{ev.progress}%</div>
                      </div>
                    </td>
                    <td className="px-3 py-4"><span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-black text-white font-bold">{ev.score || '—'}</span></td>
                    <td className="px-3 py-4 text-xs">
                      <div className="flex gap-1"><span className="px-2 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">R {ev.red_score || 0}</span><span className="px-2 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200">B {ev.blue_score || 0}</span></div>
                    </td>
                    <td className="px-5 py-4 text-right"><Link to={`/dashboard/evaluations/${ev.id}`} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-black text-white text-xs font-medium">Open <ArrowRight className="w-3 h-3" /></Link></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="p-10 text-center text-black/50">No evaluations yet. Launch your first ascent.</div>}
      </div>

      {showNew && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowNew(false)}>
          <form onSubmit={create} onClick={e => e.stopPropagation()} className="w-full max-w-[520px] rounded-[24px] bg-white p-6 md:p-8 text-black">
            <h3 className="font-display text-xl font-bold">Start evaluation</h3>
            <p className="text-sm text-black/60">Choose a verified target. Red & Blue routes will run in isolated workers.</p>
            <div className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-semibold tracking-wide text-black/60">TARGET</label>
                <select value={form.target_id} onChange={e => setForm({ ...form, target_id: e.target.value })} required className="mt-1 w-full px-3 py-3 rounded-xl bg-black/[0.04] border border-black/10 outline-none text-sm">
                  <option value="">Select target...</option>
                  {targets.map(t => <option key={t.id} value={t.id}>{t.name} — {t.type} ({t.url})</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold tracking-wide text-black/60">EVALUATION NAME (optional)</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g., Weekly Sweep #43" className="mt-1 w-full px-3 py-3 rounded-xl bg-black/[0.04] border border-black/10 outline-none text-sm" />
              </div>
              <div className="rounded-xl bg-black text-white p-3 text-xs flex gap-3">
                <Activity className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Estimated duration ~25–35s • 20 checkpoints • live evidence streaming via SSE.</span>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button type="button" onClick={() => setShowNew(false)} className="flex-1 py-3 rounded-full bg-white border border-black/10 font-medium">Cancel</button>
              <button disabled={busy} className="flex-1 py-3 rounded-full bg-black text-white font-semibold disabled:opacity-60">{busy ? 'Launching...' : 'Launch →'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
