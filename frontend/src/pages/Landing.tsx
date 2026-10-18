import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Mountain, ShieldCheck, Zap, Eye, Lock, Cpu, Globe, Container,
  ArrowRight, Play, CheckCircle2, AlertTriangle, Sparkles, Activity, Target, Layers, TrendingUp, Users
} from 'lucide-react'

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#060A14] text-white overflow-x-hidden">
      {/* nav */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[#060A14]/70 border-b border-white/10">
        <div className="max-w-[1280px] mx-auto px-6 h-[64px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 grid place-items-center glow-amber"><Mountain className="w-5 h-5 text-black" /></div>
            <div><div className="font-display font-bold tracking-tight">INVICTUS</div><div className="text-[10px] tracking-[0.2em] text-white/50">AI SAFETY EVALUATOR</div></div>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-white/70">
            <a href="#solution" className="hover:text-white">Solution</a>
            <a href="#architecture" className="hover:text-white">Architecture</a>
            <a href="#market" className="hover:text-white">Impact</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden md:inline text-sm text-white/80 hover:text-white">Sign in</Link>
            <Link to="/dashboard" className="px-5 py-2.5 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition">Launch Console →</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 mesh-bg" />
        <div className="absolute inset-0 grid-pattern opacity-40" />
        <div className="relative max-w-[1280px] mx-auto px-6 pt-14 pb-10 md:pt-20 md:pb-16">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
            <Sparkles className="w-3.5 h-3.5" /> Securing Adversarial AI Safety Testing Infrastructure — Private Beta
          </motion.div>

          <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-10 items-center mt-6">
            <div>
              <h1 className="font-display text-[42px] md:text-[56px] font-bold leading-[0.95] tracking-tight">
                Every AI safety<br />
                <span className="text-gradient">test is a climb</span><br />
                toward trust.
              </h1>
              <p className="mt-5 text-[17px] leading-relaxed text-white/65 max-w-[560px]">
                INVICTUS is the unified evaluation workflow for adversarial AI safety. Controlled red / blue routes, evidence-backed findings, and a single view from Base Camp to Summit.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-black font-semibold hover:opacity-95 transition">
                  Start free evaluation <ArrowRight className="w-4 h-4" />
                </Link>
                <button className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 border border-white/15 backdrop-blur text-white font-medium hover:bg-white/15">
                  <Play className="w-4 h-4" /> Watch demo
                </button>
              </div>

              <div className="mt-8 flex flex-wrap gap-2 text-xs">
                {['Website (Playwright)', 'Model API (adapters)', 'Sandbox / Container'].map(t => (
                  <span key={t} className="px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-white/70">{t}</span>
                ))}
              </div>

              <div className="mt-8 grid grid-cols-3 gap-6 max-w-[520px] border-t border-white/10 pt-6">
                <div><div className="text-2xl font-bold">20+</div><div className="text-xs text-white/50">Test vectors</div></div>
                <div><div className="text-2xl font-bold">~68%</div><div className="text-xs text-white/50">Avg. block rate</div></div>
                <div><div className="text-2xl font-bold">&lt;2s</div><div className="text-xs text-white/50">Per-check eval</div></div>
              </div>
            </div>

            {/* hero card - dashboard preview */}
            <motion.div initial={{ opacity: 0, y: 20, rotate: -0.5 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ duration: 0.7, delay: 0.1 }} className="relative">
              <div className="rounded-[28px] bg-gradient-to-b from-white/[0.08] to-white/[0.03] border border-white/10 backdrop-blur-xl p-4 md:p-6 shadow-card overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> LIVE EVALUATION</div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-white text-black font-semibold">AstraChat API • #42</span>
                </div>

                {/* mountain mini */}
                <div className="mt-4 rounded-2xl overflow-hidden border border-white/10 bg-[#0B1222]">
                  <div className="h-[220px] relative grid place-items-center bg-gradient-to-b from-slate-800 to-slate-900">
                    <svg viewBox="0 0 400 160" className="w-full h-full">
                      <path d="M20 140 L120 70 L170 40 L200 14 L230 40 L280 70 L380 140 Z" fill="#0F172A" stroke="rgba(255,255,255,0.08)" />
                      <path d="M170 40 L200 14 L230 40 L216 50 L200 32 L184 50 Z" fill="#FDE68A" />
                      <path d="M 60 110 Q 200 95 340 110" stroke="rgba(255,255,255,0.08)" fill="none" />
                      {/* routes */}
                      <path d="M120 90 L150 65 L180 45" stroke="#EF4444" strokeWidth="2.5" strokeDasharray="6 4" fill="none" />
                      <path d="M280 90 L250 65 L220 45" stroke="#38BDF8" strokeWidth="2.5" strokeDasharray="6 4" fill="none" />
                      {/* nodes */}
                      <circle cx="120" cy="90" r="8" fill="#10B981" stroke="white" strokeWidth="1.5" />
                      <circle cx="150" cy="65" r="8" fill="#F59E0B" stroke="white" strokeWidth="1.5" />
                      <circle cx="180" cy="45" r="8" fill="#334155" stroke="white" strokeWidth="1.2" />
                      <circle cx="280" cy="90" r="8" fill="#10B981" stroke="white" strokeWidth="1.5" />
                      <circle cx="250" cy="65" r="8" fill="#10B981" stroke="white" strokeWidth="1.5" />
                      <circle cx="220" cy="45" r="8" fill="#EF4444" stroke="white" strokeWidth="1.5" />
                    </svg>
                    <div className="absolute bottom-3 left-3 right-3 flex gap-2">
                      <div className="flex-1 rounded-xl bg-black/40 backdrop-blur border border-white/10 p-2.5">
                        <div className="text-[10px] tracking-widest text-white/50">RED ROUTE</div>
                        <div className="text-sm font-semibold">62% contained</div>
                        <div className="h-1.5 mt-1 rounded-full bg-white/10 overflow-hidden"><div className="h-full w-[62%] bg-red-500" /></div>
                      </div>
                      <div className="flex-1 rounded-xl bg-black/40 backdrop-blur border border-white/10 p-2.5">
                        <div className="text-[10px] tracking-widest text-white/50">BLUE ROUTE</div>
                        <div className="text-sm font-semibold">76% healthy</div>
                        <div className="h-1.5 mt-1 rounded-full bg-white/10 overflow-hidden"><div className="h-full w-[76%] bg-sky-400" /></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-xl bg-white/[0.06] border border-white/10 p-3"><div className="text-xs text-white/50">Score</div><div className="font-bold text-amber-300">68.4</div></div>
                  <div className="rounded-xl bg-white/[0.06] border border-white/10 p-3"><div className="text-xs text-white/50">Findings</div><div className="font-bold">7 open</div></div>
                  <div className="rounded-xl bg-white/[0.06] border border-white/10 p-3"><div className="text-xs text-white/50">Evidence</div><div className="font-bold">20 clips</div></div>
                </div>
              </div>
              <div className="absolute -z-10 -inset-4 bg-gradient-to-br from-amber-500/15 via-transparent to-sky-500/15 blur-2xl rounded-[32px]" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* PROBLEM → SOLUTION 3 phases */}
      <section id="solution" className="border-t border-white/10 bg-[#0A0F1E]">
        <div className="max-w-[1280px] mx-auto px-6 py-14">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="px-3 py-1.5 rounded-full bg-white text-black font-semibold">THE JOURNEY</span>
            <span className="text-white/50">Base Camp → The Ascent → The Summit • structured tests • evidence • one view</span>
          </div>
          <div className="grid md:grid-cols-3 gap-5 mt-6">
            {[
              { k: '01 — BASE CAMP', title: 'Setup', desc: 'Register authorized target. Configure evaluation. Check connectivity & permissions.', icon: Target, color: 'from-amber-500 to-orange-500', bullets: ['Website / Model API / Sandbox', 'Scope & policy selection', 'Pre-flight checks'] },
              { k: '02 — THE ASCENT', title: 'Evaluation', desc: 'Red: controlled adversarial tests. Blue: defensive controls. Click checkpoints for evidence.', icon: Activity, color: 'from-sky-400 to-blue-500', bullets: ['20+ test vectors', 'Live Red / Blue routes', 'Per-checkpoint evidence'] },
              { k: '03 — THE SUMMIT', title: 'Results', desc: 'Findings, metrics, evidence. Remaining weaknesses, failed checks. Final report.', icon: Mountain, color: 'from-violet-500 to-fuchsia-500', bullets: ['Risk score & breakdown', 'Remediation guidance', 'Exportable report'] },
            ].map(c => (
              <div key={c.k} className="rounded-[20px] bg-white/[0.04] border border-white/10 p-6 hover:bg-white/[0.06] transition">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${c.color} grid place-items-center`}><c.icon className="w-5 h-5 text-white" /></div>
                <div className="text-[11px] tracking-[0.12em] text-white/50 mt-4">{c.k}</div>
                <h3 className="font-display text-xl font-bold mt-1">{c.title}</h3>
                <p className="text-sm text-white/60 mt-2 leading-relaxed">{c.desc}</p>
                <ul className="mt-4 space-y-2">{c.bullets.map(b => <li key={b} className="flex gap-2 text-sm text-white/75"><CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" /> {b}</li>)}</ul>
              </div>
            ))}
          </div>

          <div className="mt-10 grid md:grid-cols-3 gap-4">
            <div className="rounded-2xl bg-white text-black p-5 flex items-center justify-between">
              <div><div className="text-xs tracking-widest text-black/50">STATUS LEGEND</div><div className="font-semibold">Readable at a glance</div></div>
              <div className="flex gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">passed</span>
                <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">running</span>
                <span className="px-2.5 py-1 rounded-full bg-slate-100">pending</span>
                <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-700">failed</span>
              </div>
            </div>
            <div className="md:col-span-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 p-5 flex items-center justify-between text-black">
              <div className="font-semibold">One workflow for all target types — separate Red/Blue routes — evidence-backed findings</div>
              <ArrowRight className="w-5 h-5 shrink-0" />
            </div>
          </div>
        </div>
      </section>

      {/* ARCHITECTURE */}
      <section id="architecture" className="border-t border-white/10">
        <div className="max-w-[1280px] mx-auto px-6 py-14">
          <div className="flex items-center gap-3"><Layers className="w-5 h-5 text-amber-400" /><h2 className="font-display text-2xl font-bold">Architecture — Isolated. Auditable. Scalable.</h2></div>
          <div className="mt-6 grid lg:grid-cols-[1.1fr_0.9fr] gap-6">
            <div className="rounded-[20px] bg-white/[0.04] border border-white/10 p-6">
              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                {[
                  { t: 'Dashboard', s: 'Next.js • TS • Mountain UI', c: 'bg-white text-black' },
                  { t: 'Backend API', s: 'FastAPI • Auth • RBAC', c: 'bg-amber-500/20 text-amber-300 border border-amber-500/30' },
                  { t: 'Eval Queue', s: 'Redis • RQ', c: 'bg-white/10 text-white border border-white/15' },
                ].map(x => <div key={x.t} className={`rounded-xl p-3 ${x.c}`}><div className="font-semibold text-sm">{x.t}</div><div className="opacity-70 mt-1">{x.s}</div></div>)}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs">
                {[
                  { t: 'Evaluation Worker', s: 'Playwright • Adapters • Sandbox', c: 'bg-sky-500/15 text-sky-300 border border-sky-500/20' },
                  { t: 'Storage', s: 'PostgreSQL • Findings • Audit', c: 'bg-white/10 text-white border border-white/15' },
                  { t: 'Scoring & Evidence', s: 'Outcomes • Evidence • Reports', c: 'bg-violet-500/15 text-violet-300 border border-violet-500/20' },
                ].map(x => <div key={x.t} className={`rounded-xl p-3 ${x.c}`}><div className="font-semibold text-sm">{x.t}</div><div className="opacity-70 mt-1">{x.s}</div></div>)}
              </div>
              <div className="mt-6 rounded-xl bg-white text-black p-4 flex flex-wrap gap-3 text-xs font-medium">
                <span className="inline-flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> Isolated envs</span>
                <span className="inline-flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5" /> Red-team machine</span>
                <span className="inline-flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Blue-team machine</span>
                <span className="inline-flex items-center gap-1.5"><Container className="w-3.5 h-3.5" /> Model environment</span>
                <span className="ml-auto px-3 py-1 rounded-full bg-black text-white">Private network</span>
              </div>
            </div>
            <div className="rounded-[20px] bg-white text-black p-6">
              <h3 className="font-display font-bold text-lg">Validation & Security</h3>
              <ul className="mt-4 space-y-3 text-sm">
                {[
                  'Target validation → Test execution → Outcome scoring → Evidence storage → Findings & report',
                  'RBAC, separation between Red/Blue/model, restricted network, resource limits, credential protection, audit integrity',
                  'Acceptance: Model API run stores results • Website run records outcomes • Sandbox respects limits',
                ].map((t, i) => <li key={i} className="flex gap-3"><span className="w-6 h-6 rounded-full bg-black text-white grid place-items-center text-xs shrink-0">{i + 1}</span><span className="leading-relaxed">{t}</span></li>)}
              </ul>
              <div className="mt-6 rounded-xl bg-black text-white p-4">
                <div className="text-xs tracking-widest text-white/60">DEMO SEQUENCE</div>
                <ol className="mt-2 space-y-1 text-sm text-white/90 list-decimal list-inside">
                  <li>Register a target</li><li>Start an evaluation</li><li>Watch Red & Blue routes update live</li><li>Click a checkpoint → inspect evidence</li><li>View final report</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* IMPACT / MARKET */}
      <section id="market" className="border-t border-white/10 bg-[#0A0F1E]">
        <div className="max-w-[1280px] mx-auto px-6 py-12 grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-white/10 border border-white/10"><TrendingUp className="w-3.5 h-3.5" /> Market momentum</div>
            <h3 className="font-display text-3xl font-bold mt-3 leading-tight">Built for the $4.8B AI security wave.</h3>
            <p className="text-white/60 mt-3 leading-relaxed">Target users: AI app developers, product companies, security testing teams, orgs deploying AI apps, researchers evaluating model behavior.</p>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white text-black p-4"><div className="text-xs text-black/50">GARTNER 2026</div><div className="text-xl font-bold">~$4.8B in 2027</div><div className="text-xs text-black/60">Securing AI • +68.7% YoY</div></div>
              <div className="rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-black p-4"><div className="text-xs text-black/60">NARROW • MODEL SECURITY</div><div className="text-xl font-bold">$14.76B by 2036</div><div className="text-xs text-black/70">24.5% CAGR • red teaming</div></div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2 text-xs">
              {['Subscription plans', 'Usage-based evals', 'Enterprise licensing', 'Self-hosted'].map(x => <span key={x} className="px-3 py-1.5 rounded-full bg-white/10 border border-white/15">{x}</span>)}
            </div>
          </div>
          <div className="rounded-[20px] bg-white text-black p-6">
            <div className="flex items-center gap-2 font-semibold"><Users className="w-4 h-4" /> Why teams choose Invictus</div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              {[
                { title: 'One workflow', desc: 'Website, model API, sandbox — same UX.' },
                { title: 'Comparable results', desc: 'Repeatable, versioned, diffable.' },
                { title: 'Inspectable', desc: 'Every finding has evidence & logs.' },
                { title: 'Fix faster', desc: 'Remediation guidance per failure.' },
              ].map(c => <div key={c.title} className="rounded-xl bg-black/[0.06] p-4"><div className="font-semibold">{c.title}</div><div className="text-black/60 mt-1">{c.desc}</div></div>)}
            </div>
            <Link to="/dashboard" className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black text-white text-sm font-semibold">Try the console <ArrowRight className="w-4 h-4" /></Link>
          </div>
        </div>
      </section>

      {/* footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-[1280px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/50">
          <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-white grid place-items-center"><Mountain className="w-4 h-4 text-black" /></div> <span className="font-display font-bold text-white">INVICTUS</span> — Every AI safety test is a climb toward trust. <span className="hidden md:inline">Team: MD Rashid Hussain (Frontend & Design) • Arpit Kumar (Backend & Logic)</span></div>
          <div>© 2025 Invictus Labs • Hack & Hills</div>
        </div>
      </footer>
    </div>
  )
}
