import { useEffect, useState } from 'react'
import { api, Finding } from '../lib/api'
import { AlertTriangle, ShieldCheck, Search, Filter } from 'lucide-react'

export default function FindingsPage() {
  const [findings, setFindings] = useState<Finding[]>([])
  const [q, setQ] = useState('')
  const [sev, setSev] = useState('all')

  const load = () => api.get('/api/findings' + (sev !== 'all' ? `?severity=${sev}` : '')).then(r => setFindings(r.data))
  useEffect(() => { load() }, [sev])

  const filtered = findings.filter(f => (f.title + f.description).toLowerCase().includes(q.toLowerCase()))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs"><span className="px-3 py-1 rounded-full bg-red-500 text-white font-semibold">FINDINGS</span><span className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-white/60">Evidence-backed • triaged</span></div>
          <h1 className="font-display text-[30px] font-bold mt-3">Findings & Weaknesses</h1>
          <p className="text-white/60">All failed checks across evaluations. Every finding links to evidence.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/[0.06] border border-white/10 flex-1 max-w-[420px]">
          <Search className="w-4 h-4 text-white/50" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search findings..." className="flex-1 bg-transparent outline-none text-sm placeholder:text-white/40" />
        </div>
        <div className="flex gap-2 text-xs">
          {['all', 'critical', 'high', 'medium', 'low'].map(s => (
            <button key={s} onClick={() => setSev(s)} className={`px-3 py-2 rounded-full border capitalize ${sev === s ? 'bg-white text-black border-white' : 'bg-white/10 text-white border-white/10'}`}>{s}</button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(f => (
          <div key={f.id} className="rounded-[20px] bg-white p-5 hover:shadow-xl transition">
            <div className="flex items-start justify-between gap-3">
              <span className={`w-9 h-9 rounded-xl grid place-items-center text-white ${f.severity === 'critical' ? 'bg-red-600' : f.severity === 'high' ? 'bg-amber-500' : f.severity === 'medium' ? 'bg-sky-500' : 'bg-slate-400'}`}><AlertTriangle className="w-5 h-5" /></span>
              <span className={`text-xs px-2.5 py-1 rounded-full border capitalize ${f.severity === 'critical' ? 'bg-red-50 text-red-700 border-red-200' : f.severity === 'high' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-sky-50 text-sky-700 border-sky-200'}`}>{f.severity} • CVSS {f.cvss}</span>
            </div>
            <h3 className="font-display font-bold mt-3 leading-tight">{f.title}</h3>
            <p className="text-sm text-black/60 mt-2 line-clamp-3 leading-relaxed">{f.description}</p>
            {f.remediation && <div className="mt-3 rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm"><span className="font-semibold">Fix:</span> {f.remediation}</div>}
            <div className="mt-4 flex items-center justify-between text-xs">
              <span className={`px-2.5 py-1 rounded-full border ${f.status === 'open' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>{f.status}</span>
              <span className="text-black/40">{new Date(f.created_at).toLocaleDateString()}</span>
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={async () => { await api.patch(`/api/findings/${f.id}`, { status: f.status === 'open' ? 'acknowledged' : 'open' }); load() }} className="flex-1 py-2 rounded-full bg-black text-white text-sm font-medium">{f.status === 'open' ? 'Acknowledge' : 'Reopen'}</button>
            </div>
          </div>
        ))}
      </div>
      {filtered.length === 0 && <div className="rounded-[20px] bg-white/10 border border-white/10 p-12 text-center text-white/60">No findings match.</div>}
    </div>
  )
}
