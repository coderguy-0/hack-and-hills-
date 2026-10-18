import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, Target } from '../lib/api'
import { Target as TargetIcon, Globe, Cpu, Container, Plus, ShieldCheck, ArrowRight, Search, MoreHorizontal, CheckCircle2, AlertCircle, Eye, Play, Trash2 } from 'lucide-react'

const typeMeta: Record<string, { icon: any, color: string, label: string }> = {
  model_api: { icon: Cpu, color: 'from-violet-500 to-fuchsia-500', label: 'Model API' },
  website: { icon: Globe, color: 'from-sky-400 to-blue-500', label: 'Website' },
  sandbox: { icon: Container, color: 'from-emerald-500 to-teal-500', label: 'Sandbox' },
}

export default function TargetsPage() {
  const [targets, setTargets] = useState<Target[]>([])
  const [q, setQ] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({ name: '', type: 'model_api', url: '', description: '' })
  const [busy, setBusy] = useState(false)

  const load = () => api.get('/api/targets').then(r => setTargets(r.data)).catch(() => { })
  useEffect(() => { load() }, [])

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    try {
      await api.post('/api/targets', form)
      setShowNew(false)
      setForm({ name: '', type: 'model_api', url: '', description: '' })
      load()
    } finally { setBusy(false) }
  }

  const filtered = targets.filter(t => (t.name + t.url + t.type).toLowerCase().includes(q.toLowerCase()))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs"><span className="px-3 py-1 rounded-full bg-white text-black font-semibold">BASE CAMP</span><span className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-white/60">Step 1 — Register authorized target</span></div>
          <h1 className="font-display text-[30px] font-bold mt-3">Base Camp — Targets</h1>
          <p className="text-white/60">Configure where evaluations will run. Every target is verified and scoped before ascent.</p>
        </div>
        <button onClick={() => setShowNew(true)} className="px-5 py-2.5 rounded-full bg-white text-black font-semibold inline-flex items-center gap-2">New target <Plus className="w-4 h-4" /></button>
      </div>

      {/* filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/[0.06] border border-white/10 flex-1 max-w-[420px] min-w-[220px]">
          <Search className="w-4 h-4 text-white/50" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search targets, URLs, types..." className="flex-1 bg-transparent outline-none text-sm placeholder:text-white/40" />
        </div>
        <div className="flex gap-2 text-xs">
          {['All', 'Model API', 'Website', 'Sandbox'].map(x => <button key={x} onClick={() => setQ(x === 'All' ? '' : x === 'Model API' ? 'model_api' : x.toLowerCase())} className={`px-3 py-2 rounded-full border ${q.toLowerCase() === x.toLowerCase() || (x === 'All' && !q) ? 'bg-white text-black border-white' : 'bg-white/10 text-white border-white/10'}`}>{x}</button>)}
        </div>
        <span className="ml-auto text-xs text-white/50 self-center">{filtered.length} targets • verified & isolated</span>
      </div>

      {/* grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(t => {
          const m = typeMeta[t.type] || typeMeta.model_api
          return (
            <div key={t.id} className="group rounded-[20px] bg-white text-black overflow-hidden hover:shadow-xl transition">
              <div className={`h-1.5 bg-gradient-to-r ${m.color}`} />
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${m.color} grid place-items-center text-white`}><m.icon className="w-5 h-5" /></div>
                  <span className={`text-[11px] px-2.5 py-1 rounded-full border font-medium ${t.status === 'verified' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>● {t.status}</span>
                </div>
                <h3 className="font-display font-bold text-[17px] mt-3 leading-tight">{t.name}</h3>
                <div className="text-xs text-black/50 mt-1 truncate">{t.url}</div>
                <p className="text-sm text-black/60 mt-2 line-clamp-2 leading-relaxed">{t.description}</p>

                <div className="mt-4 flex items-center gap-2">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-black text-white">{m.label}</span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-black/5 border border-black/10">Risk {t.risk_score}</span>
                  <span className="ml-auto text-xs text-black/40">{new Date(t.created_at).toLocaleDateString()}</span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Link to={`/dashboard/evaluations?target=${t.id}`} className="px-3 py-2.5 rounded-full bg-black text-white text-sm font-medium text-center inline-flex items-center justify-center gap-1.5">Evaluate <Play className="w-3.5 h-3.5" /></Link>
                  <button onClick={async () => {
                    await api.post(`/api/targets/${t.id}/verify`); load()
                  }} className="px-3 py-2.5 rounded-full bg-white border border-black/10 text-sm font-medium inline-flex items-center justify-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Verify</button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && <div className="rounded-[20px] bg-white/10 border border-white/10 p-12 text-center text-white/60">No targets match. Create your first base camp.</div>}

      {/* new target modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowNew(false)}>
          <form onSubmit={create} onClick={e => e.stopPropagation()} className="w-full max-w-[560px] rounded-[24px] bg-white p-6 md:p-8 text-black">
            <h3 className="font-display text-xl font-bold">Register authorized target</h3>
            <p className="text-sm text-black/60">Only test systems you own or have explicit permission to evaluate.</p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-semibold tracking-wide text-black/60">TARGET NAME</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="e.g., AstraChat API — Prod" className="mt-1 w-full px-3 py-3 rounded-xl bg-black/[0.04] border border-black/10 outline-none focus:bg-white focus:border-black/20 text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold tracking-wide text-black/60">TYPE</label>
                <div className="mt-1 grid grid-cols-3 gap-2">
                  {[
                    { id: 'model_api', label: 'Model API', icon: Cpu },
                    { id: 'website', label: 'Website', icon: Globe },
                    { id: 'sandbox', label: 'Sandbox', icon: Container },
                  ].map(o => (
                    <button key={o.id} type="button" onClick={() => setForm({ ...form, type: o.id })} className={`px-3 py-3 rounded-xl border text-sm font-medium flex flex-col items-center gap-1.5 ${form.type === o.id ? 'bg-black text-white border-black' : 'bg-white border-black/10 hover:bg-black/[0.04]'}`}>
                      <o.icon className="w-4 h-4" /> {o.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold tracking-wide text-black/60">{form.type === 'website' ? 'URL' : form.type === 'sandbox' ? 'SANDBOX URI' : 'ENDPOINT'}</label>
                <input value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} required placeholder={form.type === 'website' ? 'https://example.com' : form.type === 'sandbox' ? 'sandbox://worker-04' : 'https://api.example.com/v1/chat'} className="mt-1 w-full px-3 py-3 rounded-xl bg-black/[0.04] border border-black/10 outline-none focus:bg-white focus:border-black/20 text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold tracking-wide text-black/60">DESCRIPTION (optional)</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Scope, intended use, data handling notes..." className="mt-1 w-full px-3 py-3 rounded-xl bg-black/[0.04] border border-black/10 outline-none focus:bg-white focus:border-black/20 text-sm" />
              </div>
              <div className="flex items-start gap-2 text-xs text-black/60 bg-amber-50 border border-amber-200 rounded-xl p-3">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>By registering, you confirm you are authorized to test this target. Unauthorized testing is prohibited and logged.</span>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button type="button" onClick={() => setShowNew(false)} className="flex-1 py-3 rounded-full bg-white border border-black/10 font-medium">Cancel</button>
              <button disabled={busy} className="flex-1 py-3 rounded-full bg-black text-white font-semibold disabled:opacity-60">{busy ? 'Registering...' : 'Register & verify →'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-[16px] bg-white/[0.06] border border-white/10 p-4 flex flex-wrap items-center gap-3 text-sm">
        <ShieldCheck className="w-4 h-4 text-emerald-400" /> <span className="text-white/80">Next: Start an evaluation from any target card. The Ascent will stream Red & Blue checkpoints live.</span>
        <Link to="/dashboard/evaluations" className="ml-auto px-4 py-2 rounded-full bg-white text-black text-sm font-semibold">Go to The Ascent</Link>
      </div>
    </div>
  )
}
