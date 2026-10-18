import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { ShieldCheck, Flame, Eye, Search, Filter } from 'lucide-react'

type CaseItem = { id: string; name: string; route: string; category: string; severity: string; description: string; remediation: string }

export default function LibraryPage() {
  const [items, setItems] = useState<CaseItem[]>([])
  const [q, setQ] = useState('')
  const [route, setRoute] = useState<'all'|'red'|'blue'>('all')

  useEffect(() => { api.get('/api/library').then(r => setItems(r.data)) }, [])

  const filtered = items.filter(i =>
    (route === 'all' || i.route === route) &&
    (i.name + i.category + i.description).toLowerCase().includes(q.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 text-xs"><span className="px-3 py-1 rounded-full bg-white text-black font-semibold">TEST LIBRARY</span><span className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-white/60">{items.length} vectors • curated</span></div>
        <h1 className="font-display text-[30px] font-bold mt-3">Test Library — Red & Blue Catalog</h1>
        <p className="text-white/60">Every evaluation draws from this library. Red = adversarial probes. Blue = defensive controls.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/[0.06] border border-white/10 flex-1 max-w-[420px]">
          <Search className="w-4 h-4 text-white/50" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search tests, categories..." className="flex-1 bg-transparent outline-none text-sm placeholder:text-white/40" />
        </div>
        <div className="flex gap-2 text-xs">
          {(['all','red','blue'] as const).map(r => (
            <button key={r} onClick={() => setRoute(r)} className={`px-3 py-2 rounded-full border capitalize ${route===r ? 'bg-white text-black border-white' : 'bg-white/10 text-white border-white/10'}`}>{r === 'all' ? 'All routes' : r === 'red' ? '🔴 Red' : '🔵 Blue'}</button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(it => (
          <div key={it.id} className="rounded-[20px] bg-white p-5 hover:shadow-xl transition">
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium text-white ${it.route==='red' ? 'bg-red-500' : 'bg-sky-500'}`}>{it.route.toUpperCase()}</span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-black/5 border border-black/10">{it.category}</span>
              <span className={`ml-auto text-xs px-2 py-1 rounded-full border ${it.severity==='critical' ? 'bg-red-50 text-red-700 border-red-200' : it.severity==='high' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-sky-50 text-sky-700 border-sky-200'}`}>{it.severity}</span>
            </div>
            <h3 className="font-display font-bold mt-3 leading-tight">{it.name}</h3>
            <p className="text-sm text-black/60 mt-2 leading-relaxed">{it.description}</p>
            <div className="mt-3 rounded-xl bg-black/[0.04] border border-black/10 p-3 text-xs">
              <span className="font-semibold">Remediation:</span> {it.remediation}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
