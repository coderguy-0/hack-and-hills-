import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mountain, Mail, Lock, ArrowRight, Eye, ShieldCheck, Sparkles } from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../store/auth'

export default function Login() {
  const [email, setEmail] = useState('demo@invictus.ai')
  const [password, setPassword] = useState('demo1234')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const nav = useNavigate()
  const { setAuth } = useAuth()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setErr('')
    try {
      const { data } = await api.post('/api/auth/login', { email, password })
      setAuth(data.user, data.access_token)
      nav('/dashboard')
    } catch (e: any) {
      setErr(e.response?.data?.detail || 'Login failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#060A14]">
      {/* left */}
      <div className="relative hidden lg:flex flex-col justify-between p-10 overflow-hidden">
        <div className="absolute inset-0 mesh-bg" />
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="absolute -bottom-20 -left-20 w-[600px] h-[600px] bg-amber-500/15 blur-[80px] rounded-full" />
        <div className="relative">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 grid place-items-center"><Mountain className="w-5 h-5 text-black" /></div>
            <div><div className="font-display font-bold text-white">INVICTUS</div><div className="text-xs tracking-[0.15em] text-white/50">AI SAFETY EVALUATOR</div></div>
          </Link>
          <div className="mt-16 max-w-[480px]">
            <div className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full bg-white/10 border border-white/10 text-white/70"><ShieldCheck className="w-3.5 h-3.5" /> Trusted evaluation infrastructure</div>
            <h1 className="font-display text-[40px] font-bold leading-none mt-4 text-white">Climb with<br /><span className="text-gradient">confidence.</span></h1>
            <p className="text-white/60 mt-4 leading-relaxed">Sign in to run controlled red & blue evaluations, inspect evidence, and ship safer AI.</p>
            <div className="mt-8 grid grid-cols-3 gap-3">
              {[
                { k: 'Isolated workers', v: 'Red/Blue separation' },
                { k: 'Evidence Vault', v: 'Immutable logs' },
                { k: 'Audit Ready', v: 'RBAC + trails' },
              ].map(x => <div key={x.k} className="rounded-xl bg-white/[0.06] border border-white/10 p-3"><div className="text-xs text-white/50">{x.k}</div><div className="text-sm font-medium text-white">{x.v}</div></div>)}
            </div>
          </div>
        </div>
        <div className="relative text-xs text-white/40">© 2025 Invictus Labs • Private network • SOC2-ready</div>
      </div>

      {/* right form */}
      <div className="flex items-center justify-center p-6 md:p-10 bg-[#0A0F1E] border-l border-white/10">
        <div className="w-full max-w-[420px]">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 grid place-items-center"><Mountain className="w-5 h-5 text-black" /></div>
            <div><div className="font-display font-bold">INVICTUS</div><div className="text-xs text-white/50">AI SAFETY EVALUATOR</div></div>
          </div>

          <div className="rounded-[24px] bg-white p-7 md:p-8 shadow-card text-black">
            <h2 className="font-display text-2xl font-bold">Welcome back</h2>
            <p className="text-sm text-black/60 mt-1">Use demo credentials or create an account.</p>

            <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-3 flex items-start gap-3 text-sm">
              <Sparkles className="w-4 h-4 text-amber-600 mt-0.5" />
              <div><div className="font-medium">Demo access</div><div className="text-black/60 text-xs mt-1">Email: <b>demo@invictus.ai</b> — Password: <b>demo1234</b> — pre-seeded with targets & history.</div></div>
            </div>

            <form onSubmit={submit} className="mt-6 space-y-4">
              <div>
                <label className="text-xs font-semibold tracking-wide text-black/60">EMAIL</label>
                <div className="mt-1 flex items-center gap-2 px-3 py-3 rounded-xl bg-black/[0.04] border border-black/10 focus-within:border-black/20 focus-within:bg-white">
                  <Mail className="w-4 h-4 text-black/40" />
                  <input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@team.ai" className="flex-1 bg-transparent outline-none text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold tracking-wide text-black/60">PASSWORD</label>
                <div className="mt-1 flex items-center gap-2 px-3 py-3 rounded-xl bg-black/[0.04] border border-black/10 focus-within:border-black/20 focus-within:bg-white">
                  <Lock className="w-4 h-4 text-black/40" />
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="flex-1 bg-transparent outline-none text-sm" />
                  <Eye className="w-4 h-4 text-black/30" />
                </div>
              </div>

              {err && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{err}</div>}

              <button disabled={loading} className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-full bg-black text-white font-semibold hover:bg-black/90 disabled:opacity-60">
                {loading ? 'Signing in...' : 'Sign in'} <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center text-xs text-black/50">New here? <button type="button" onClick={async () => {
                try {
                  const { data } = await api.post('/api/auth/register', { email, password, name: email.split('@')[0] })
                  setAuth(data.user, data.access_token); nav('/dashboard')
                } catch (e: any) { setErr(e.response?.data?.detail || 'Registration failed') }
              }} className="underline font-medium text-black">Create account</button></div>
            </form>

            <div className="mt-6 flex items-center gap-2 text-xs text-black/40">
              <ShieldCheck className="w-3.5 h-3.5" /> Audit-logged • Encrypted • Private network
            </div>
          </div>

          <div className="text-center text-xs text-white/40 mt-6">By continuing you agree to authorized testing only.</div>
        </div>
      </div>
    </div>
  )
}
