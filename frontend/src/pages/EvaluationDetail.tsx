import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api, EvaluationDetail as EvalDetail, Checkpoint } from '../lib/api'
import { MountainMap } from '../components/MountainMap'
import { ArrowLeft, Clock, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, Activity, FileText, Play, RotateCcw, Copy, ExternalLink } from 'lucide-react'

export default function EvaluationDetail() {
  const { id } = useParams()
  const [data, setData] = useState<EvalDetail | null>(null)
  const [selected, setSelected] = useState<Checkpoint | null>(null)
  const [live, setLive] = useState(true)
  const esRef = useRef<EventSource | null>(null)

  const fetchData = async () => {
    const { data } = await api.get(`/api/evaluations/${id}`)
    setData(data)
    if (!selected && data.checkpoints.length) setSelected(data.checkpoints.find((c: Checkpoint) => c.status === 'running') || data.checkpoints[0])
  }

  useEffect(() => { fetchData() }, [id])

  // SSE
  useEffect(() => {
    if (!id || !live) return
    const token = localStorage.getItem('invictus_token')
    // SSE with auth via query would need backend support; for now use direct EventSource without auth (allowed for demo)
    const es = new EventSource(`/api/evaluations/${id}/stream`)
    esRef.current = es
    es.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data)
        if (msg.type === 'checkpoint' || msg.type === 'status' || msg.type === 'done') {
          // update local state: fetch fresh for simplicity
          fetchData()
        }
        if (msg.type === 'done') {
          setLive(false)
          es.close()
        }
      } catch { }
    }
    es.onerror = () => { /* retry via polling */ }
    return () => es.close()
  }, [id, live])

  // polling fallback
  useEffect(() => {
    if (!data || data.status === 'completed') return
    const iv = setInterval(fetchData, 2000)
    return () => clearInterval(iv)
  }, [data?.status])

  if (!data) return <div className="min-h-[40vh] grid place-items-center text-white/60">Loading evaluation…</div>

  const reds = data.checkpoints.filter(c => c.route === 'red')
  const blues = data.checkpoints.filter(c => c.route === 'blue')
  const pct = (arr: Checkpoint[], st: string) => arr.length ? Math.round(arr.filter(c => c.status === st).length / arr.length * 100) : 0
  const passed = data.checkpoints.filter(c => c.status === 'passed').length
  const failed = data.checkpoints.filter(c => c.status === 'failed').length

  return (
    <div className="space-y-5">
      <Link to="/dashboard/evaluations" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white"><ArrowLeft className="w-4 h-4" /> Back to evaluations</Link>

      {/* header */}
      <div className="rounded-[20px] bg-white p-5 md:p-6 text-black">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className={`px-3 py-1 rounded-full border font-medium ${data.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>{data.status === 'completed' ? '✓ completed' : '● ' + data.status}</span>
              <span className="px-3 py-1 rounded-full bg-black text-white">{data.target?.name || data.target_id}</span>
              <span className="px-3 py-1 rounded-full bg-black/5 border border-black/10">{data.id}</span>
              <span className="text-black/50">{new Date(data.created_at).toLocaleString()}</span>
            </div>
            <h1 className="font-display text-2xl font-bold mt-3">{data.name}</h1>
            <p className="text-sm text-black/60 mt-1">{data.target?.url} • {data.target?.type} • isolated workers • private network</p>
          </div>
          <div className="flex gap-2">
            <button onClick={async () => { const { data: r } = await api.post(`/api/evaluations/${data.id}/rerun`); window.location.href = `/dashboard/evaluations/${r.id}` }} className="px-4 py-2 rounded-full bg-white border border-black/10 text-sm font-medium inline-flex items-center gap-1.5"><RotateCcw className="w-4 h-4" /> Rerun</button>
            <Link to={`/dashboard/reports/${data.id}`} className="px-4 py-2 rounded-full bg-black text-white text-sm font-medium inline-flex items-center gap-1.5"><FileText className="w-4 h-4" /> View report</Link>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="rounded-2xl bg-black text-white p-4 text-center"><div className="text-3xl font-bold">{data.score || 0}</div><div className="text-xs text-white/60">Overall score</div></div>
          <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-center"><div className="text-2xl font-bold text-red-600">{data.red_score || 0}</div><div className="text-xs text-black/60">Red — blocked</div></div>
          <div className="rounded-2xl bg-sky-50 border border-sky-200 p-4 text-center"><div className="text-2xl font-bold text-sky-600">{data.blue_score || 0}</div><div className="text-xs text-black/60">Blue — healthy</div></div>
          <div className="rounded-2xl bg-black/5 border border-black/10 p-4 text-center"><div className="text-2xl font-bold">{data.progress}%</div><div className="text-xs text-black/50">Progress</div><div className="h-1.5 mt-2 rounded-full bg-black/10 overflow-hidden"><div className="h-full bg-black" style={{ width: `${data.progress}%` }} /></div></div>
          <div className="rounded-2xl bg-black/5 border border-black/10 p-4 text-center"><div className="text-sm font-bold">{passed} ✓ • {failed} ✕</div><div className="text-xs text-black/50">out of {data.checkpoints.length}</div></div>
        </div>
      </div>

      {/* mountain map */}
      <MountainMap checkpoints={data.checkpoints} onSelect={setSelected} activeId={selected?.id} />

      {/* progress strips */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-[16px] bg-white/[0.06] border border-white/10 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold"><span className="w-2 h-2 rounded-full bg-red-500" /> Red route — adversarial tests</div>
          <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden flex">{['passed', 'failed', 'running', 'pending'].map(s => {
            const n = reds.filter(c => c.status === s).length
            const w = reds.length ? (n / reds.length * 100) : 0
            const col = s === 'passed' ? 'bg-emerald-500' : s === 'failed' ? 'bg-red-500' : s === 'running' ? 'bg-amber-500' : 'bg-white/15'
            return <div key={s} className={`${col}`} style={{ width: `${w}%` }} />
          })}</div>
          <div className="mt-2 flex gap-2 text-xs flex-wrap">{reds.map(c => <span key={c.id} className={`px-2 py-1 rounded-full border text-xs ${c.status === 'passed' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20' : c.status === 'failed' ? 'bg-red-500/15 text-red-300 border-red-500/20' : c.status === 'running' ? 'bg-amber-500/15 text-amber-300 border-amber-500/20' : 'bg-white/5 text-white/50 border-white/10'}`}>{c.name.slice(0, 18)}</span>)}</div>
        </div>
        <div className="rounded-[16px] bg-white/[0.06] border border-white/10 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold"><span className="w-2 h-2 rounded-full bg-sky-400" /> Blue route — defensive controls</div>
          <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden flex">{['passed', 'failed', 'running', 'pending'].map(s => {
            const n = blues.filter(c => c.status === s).length
            const w = blues.length ? (n / blues.length * 100) : 0
            const col = s === 'passed' ? 'bg-emerald-500' : s === 'failed' ? 'bg-red-500' : s === 'running' ? 'bg-amber-500' : 'bg-white/15'
            return <div key={s} className={`${col}`} style={{ width: `${w}%` }} />
          })}</div>
          <div className="mt-2 flex gap-2 text-xs flex-wrap">{blues.map(c => <span key={c.id} className={`px-2 py-1 rounded-full border text-xs ${c.status === 'passed' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20' : c.status === 'failed' ? 'bg-red-500/15 text-red-300 border-red-500/20' : c.status === 'running' ? 'bg-amber-500/15 text-amber-300 border-amber-500/20' : 'bg-white/5 text-white/50 border-white/10'}`}>{c.name.slice(0, 18)}</span>)}</div>
        </div>
      </div>

      {/* checkpoints + evidence */}
      <div className="grid lg:grid-cols-[380px_1fr] gap-4">
        <div className="rounded-[20px] bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-black/10 flex items-center justify-between"><h3 className="font-display font-bold">Checkpoints</h3><span className="text-xs px-2 py-1 rounded-full bg-black text-white">{data.checkpoints.length} total</span></div>
          <div className="max-h-[560px] overflow-y-auto divide-y divide-black/10">
            {data.checkpoints.map(cp => (
              <button key={cp.id} onClick={() => setSelected(cp)} className={`w-full text-left px-4 py-3 flex gap-3 hover:bg-black/[0.04] ${selected?.id === cp.id ? 'bg-black/[0.06] border-l-4 border-black' : 'border-l-4 border-transparent'}`}>
                <span className={`w-8 h-8 rounded-full grid place-items-center text-white shrink-0 mt-0.5 ${cp.status === 'passed' ? 'bg-emerald-500' : cp.status === 'failed' ? 'bg-red-500' : cp.status === 'running' ? 'bg-amber-500 animate-pulse' : 'bg-slate-300'}`}>
                  {cp.status === 'passed' ? <CheckCircle2 className="w-4 h-4" /> : cp.status === 'failed' ? <XCircle className="w-4 h-4" /> : cp.status === 'running' ? <Clock className="w-4 h-4" /> : <span className="text-xs">•</span>}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium leading-tight">{cp.name}</div>
                  <div className="text-xs text-black/50">{cp.category} • {cp.route === 'red' ? 'Red' : 'Blue'} • {cp.severity} • {cp.duration_ms ? `${cp.duration_ms}ms` : '—'}</div>
                </div>
                <span className={`self-start text-[11px] px-2 py-1 rounded-full border font-medium ${cp.status === 'passed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : cp.status === 'failed' ? 'bg-red-50 text-red-700 border-red-200' : cp.status === 'running' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-100 border-slate-200'}`}>{cp.status}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[20px] bg-white overflow-hidden">
          {!selected ? <div className="p-12 text-center text-black/50">Select a checkpoint to inspect evidence.</div> : (
            <>
              <div className="px-5 py-4 border-b border-black/10 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2"><span className={`text-xs px-2.5 py-1 rounded-full font-medium ${selected.route === 'red' ? 'bg-red-500 text-white' : 'bg-sky-500 text-white'}`}>{selected.route.toUpperCase()}</span><span className="text-xs px-2.5 py-1 rounded-full bg-black/5 border border-black/10">{selected.category}</span><span className={`text-xs px-2 py-1 rounded-full border ${selected.severity === 'critical' ? 'bg-red-50 text-red-700 border-red-200' : selected.severity === 'high' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-sky-50 text-sky-700 border-sky-200'}`}>{selected.severity}</span></div>
                  <h3 className="font-display font-bold text-lg mt-2">{selected.name}</h3>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-sm font-medium border ${selected.status === 'passed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : selected.status === 'failed' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>{selected.status}</span>
              </div>

              <div className="p-5 space-y-4">
                <div className={`rounded-xl p-4 border ${selected.status === 'failed' ? 'bg-red-50 border-red-200' : selected.status === 'passed' ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                  <div className="text-xs tracking-widest font-semibold opacity-60">VERDICT</div>
                  <div className="font-medium mt-1">{(selected.evidence as any)?.verdict || selected.status.toUpperCase()} — {(selected.evidence as any)?.summary || 'Evidence will appear when the checkpoint runs.'}</div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="rounded-xl bg-black text-white p-4">
                    <div className="text-xs tracking-widest text-white/50 flex items-center justify-between">REQUEST <Copy className="w-3 h-3" /></div>
                    <pre className="text-xs mt-2 whitespace-pre-wrap break-words font-mono leading-relaxed text-white/90">{(selected.evidence as any)?.request || '— pending —'}</pre>
                  </div>
                  <div className="rounded-xl bg-black text-white p-4">
                    <div className="text-xs tracking-widest text-white/50">RESPONSE</div>
                    <pre className="text-xs mt-2 whitespace-pre-wrap break-words font-mono leading-relaxed text-white/90">{(selected.evidence as any)?.response || '— pending —'}</pre>
                  </div>
                </div>

                <div className="rounded-xl bg-black/[0.04] border border-black/10 p-4">
                  <div className="text-xs font-semibold tracking-wide text-black/60">LOGS</div>
                  <div className="mt-2 space-y-1 font-mono text-xs">
                    {((selected.evidence as any)?.logs as string[] | undefined)?.map((l, i) => <div key={i} className="px-2 py-1 rounded bg-black text-white/90">{l}</div>) || <div className="text-black/40">No logs yet.</div>}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { k: 'Latency', v: ((selected.evidence as any)?.metrics?.latency_ms ?? '—') + (selected.evidence?.metrics ? ' ms' : '') },
                    { k: 'Tokens', v: (selected.evidence as any)?.metrics?.tokens ?? '—' },
                    { k: 'Confidence', v: (selected.evidence as any)?.metrics?.confidence ?? '—' },
                  ].map(x => <div key={x.k} className="rounded-xl bg-black/[0.04] border border-black/10 p-3 text-center"><div className="text-xs text-black/50">{x.k}</div><div className="font-bold">{x.v}</div></div>)}
                </div>

                {selected.status === 'failed' && (
                  <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
                    <div className="text-sm font-semibold flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-600" /> Remediation guidance</div>
                    <p className="text-sm text-black/70 mt-2 leading-relaxed">{data.findings.find(f => f.checkpoint_id === selected.id)?.remediation || 'Review control configuration and add compensating detection.'}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* findings quick list */}
      {data.findings.length > 0 && (
        <div className="rounded-[20px] bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-black/10 flex items-center justify-between"><h3 className="font-display font-bold">Findings ({data.findings.length})</h3><span className="text-xs px-2 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">{data.findings.filter(f => f.severity === 'critical').length} critical</span></div>
          <div className="divide-y divide-black/10">
            {data.findings.map(f => (
              <div key={f.id} className="px-5 py-4 flex gap-4">
                <span className={`w-8 h-8 rounded-full grid place-items-center text-white shrink-0 ${f.severity === 'critical' ? 'bg-red-600' : f.severity === 'high' ? 'bg-amber-500' : 'bg-sky-500'}`}><AlertTriangle className="w-4 h-4" /></span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{f.title}</div>
                  <div className="text-sm text-black/60 mt-1">{f.description}</div>
                  <div className="text-xs text-black/40 mt-2">CVSS {f.cvss} • {f.status} • {new Date(f.created_at).toLocaleString()}</div>
                </div>
                <span className={`self-start text-xs px-2.5 py-1 rounded-full border ${f.severity === 'critical' ? 'bg-red-50 text-red-700 border-red-200' : f.severity === 'high' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-sky-50 text-sky-700 border-sky-200'}`}>{f.severity}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
