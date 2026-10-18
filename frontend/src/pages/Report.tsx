import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api, EvaluationDetail } from '../lib/api'
import { Mountain, ArrowLeft, Download, ShieldCheck, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'

export default function ReportPage() {
  const { id } = useParams()
  const [data, setData] = useState<EvaluationDetail | null>(null)
  useEffect(() => { if (id) api.get(`/api/evaluations/${id}`).then(r => setData(r.data)) }, [id])

  if (!data) return <div className="min-h-[40vh] grid place-items-center text-white/60">Loading report…</div>

  // if route is /dashboard/reports without id, show list
  if (!id) return (
    <div className="space-y-6">
      <h1 className="font-display text-[30px] font-bold">Reports</h1>
      <p className="text-white/60">Select an evaluation to view its summit report.</p>
    </div>
  )

  const handlePrint = () => window.print()

  const passed = data.checkpoints.filter(c => c.status === 'passed').length
  const failed = data.checkpoints.filter(c => c.status === 'failed').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to={`/dashboard/evaluations/${data.id}`} className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white"><ArrowLeft className="w-4 h-4" /> Back to evaluation</Link>
        <button onClick={handlePrint} className="px-4 py-2 rounded-full bg-white text-black text-sm font-semibold inline-flex items-center gap-2"><Download className="w-4 h-4" /> Export PDF</button>
      </div>

      <div className="rounded-[24px] bg-white text-black overflow-hidden shadow-card print:shadow-none">
        {/* cover */}
        <div className="bg-black text-white p-8 md:p-10 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute -top-20 -right-20 w-[400px] h-[400px] bg-amber-500 blur-[80px] rounded-full" />
            <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-sky-500 blur-[80px] rounded-full" />
          </div>
          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white grid place-items-center"><Mountain className="w-5 h-5 text-black" /></div>
              <div><div className="font-display font-bold">INVICTUS</div><div className="text-xs tracking-widest text-white/60">AI SAFETY EVALUATOR • SUMMIT REPORT</div></div>
              <span className="ml-auto text-xs px-3 py-1 rounded-full bg-white text-black font-semibold">CONFIDENTIAL</span>
            </div>
            <h1 className="font-display text-[32px] font-bold mt-6 leading-tight">Summit Report<br /><span className="text-amber-400">{data.name}</span></h1>
            <p className="text-white/60 mt-2 max-w-[640px]">Evidence-backed findings from controlled Red & Blue evaluation. Generated on {new Date(data.created_at).toLocaleString()} • Evaluation ID {data.id} • Target {data.target?.name}</p>
            <div className="mt-6 flex flex-wrap gap-3 text-xs">
              <span className="px-3 py-1.5 rounded-full bg-white text-black font-semibold">Score {data.score} / 100</span>
              <span className="px-3 py-1.5 rounded-full bg-white/10 border border-white/20">Red {data.red_score} • Blue {data.blue_score}</span>
              <span className="px-3 py-1.5 rounded-full bg-white/10 border border-white/20">{passed} passed • {failed} failed • {data.checkpoints.length} total</span>
            </div>
          </div>
        </div>

        {/* summary */}
        <div className="p-8 md:p-10 space-y-8">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="rounded-2xl bg-black text-white p-5 text-center"><div className="text-3xl font-bold">{data.score}</div><div className="text-xs text-white/60">Overall safety score</div></div>
            <div className="rounded-2xl bg-red-50 border border-red-200 p-5 text-center"><div className="text-2xl font-bold text-red-600">{data.red_score}</div><div className="text-xs text-black/60">Red route — adversarial blocked</div></div>
            <div className="rounded-2xl bg-sky-50 border border-sky-200 p-5 text-center"><div className="text-2xl font-bold text-sky-600">{data.blue_score}</div><div className="text-xs text-black/60">Blue route — controls healthy</div></div>
          </div>

          <section>
            <h2 className="font-display text-xl font-bold">Executive summary</h2>
            <p className="text-sm text-black/70 mt-2 leading-relaxed">
              Evaluation <b>{data.name}</b> against <b>{data.target?.name}</b> ({data.target?.type}) completed with an overall score of <b>{data.score}/100</b>. Red route contained <b>{data.red_score}%</b> of adversarial probes; Blue route showed <b>{data.blue_score}%</b> control health.
              {failed > 0 ? ` ${failed} checkpoint(s) failed and produced ${data.findings.length} finding(s) requiring remediation.` : ' No critical failures detected — defenses are operating nominally.'}
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">Checkpoints — all {data.checkpoints.length}</h2>
            <div className="mt-4 overflow-hidden rounded-2xl border border-black/10">
              <table className="w-full text-sm">
                <thead className="bg-black text-white text-xs tracking-widest">
                  <tr><th className="text-left px-4 py-3">CHECKPOINT</th><th className="text-left px-3 py-3">ROUTE</th><th className="text-left px-3 py-3">CATEGORY</th><th className="px-3 py-3">STATUS</th><th className="px-3 py-3">TIME</th></tr>
                </thead>
                <tbody className="divide-y divide-black/10">
                  {data.checkpoints.map(cp => (
                    <tr key={cp.id} className="hover:bg-black/[0.03]">
                      <td className="px-4 py-3 font-medium">{cp.name}</td>
                      <td className="px-3 py-3"><span className={`text-xs px-2 py-1 rounded-full text-white ${cp.route==='red' ? 'bg-red-500' : 'bg-sky-500'}`}>{cp.route}</span></td>
                      <td className="px-3 py-3 text-black/60">{cp.category}</td>
                      <td className="px-3 py-3 text-center"><span className={`text-xs px-2 py-1 rounded-full border ${cp.status==='passed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : cp.status==='failed' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>{cp.status}</span></td>
                      <td className="px-3 py-3 text-center text-black/50">{cp.duration_ms ? `${cp.duration_ms}ms` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">Findings — {data.findings.length}</h2>
            {data.findings.length === 0 ? <div className="mt-3 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm">No findings — all checkpoints passed.</div> : (
              <div className="mt-4 space-y-3">
                {data.findings.map(f => (
                  <div key={f.id} className="rounded-2xl border border-black/10 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-bold">{f.title}</h3>
                      <span className={`text-xs px-2.5 py-1 rounded-full border ${f.severity==='critical' ? 'bg-red-50 text-red-700 border-red-200' : f.severity==='high' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-sky-50 text-sky-700 border-sky-200'}`}>{f.severity} • CVSS {f.cvss}</span>
                    </div>
                    <p className="text-sm text-black/70 mt-2">{f.description}</p>
                    <div className="mt-3 rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm"><b>Remediation:</b> {f.remediation}</div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl bg-black text-white p-6">
            <h3 className="font-bold flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-400" /> Audit & integrity</h3>
            <p className="text-sm text-white/60 mt-2">All evidence stored immutably. Evaluation ID {data.id} • Completed {data.completed_at ? new Date(data.completed_at).toLocaleString() : '—'} • Private network • RBAC enforced. Report hash verifiable against audit log.</p>
          </section>

          <div className="text-center text-xs text-black/40 pt-6 border-t border-black/10">Generated by INVICTUS AI Safety Evaluator • Every AI safety test is a climb toward trust. • invictus.ai</div>
        </div>
      </div>
    </div>
  )
}
