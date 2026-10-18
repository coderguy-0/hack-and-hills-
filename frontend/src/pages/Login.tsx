import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mountain, Mail, Lock, User, ArrowRight, Eye, EyeOff, ShieldCheck, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../store/auth'

export default function Login() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('demo@invictus.ai')
  const [password, setPassword] = useState('demo1234')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [ok, setOk] = useState('')
  const nav = useNavigate()
  const { setAuth } = useAuth()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(''); setOk(''); setLoading(true)
    try {
      if (mode === 'login') {
        const { data } = await api.post('/api/auth/login', { email: email.trim(), password })
        setAuth(data.user, data.access_token)
        setOk('Signed in — redirecting...')
        setTimeout(() => nav('/dashboard'), 300)
      } else {
        if (!name.trim()) { setErr('Please enter your name'); setLoading(false); return }
        if (password.length < 4) { setErr('Password must be at least 4 characters'); setLoading(false); return }
        const { data } = await api.post('/api/auth/register', { email: email.trim(), password, name: name.trim() })
        setAuth(data.user, data.access_token)
        setOk('Account created — welcome to INVICTUS!')
        setTimeout(() => nav('/dashboard'), 400)
      }
    } catch (e: any) {
      const detail = e.response?.data?.detail || e.response?.data?.message || e.message || 'Something went wrong'
      setErr(detail)
    } finally { setLoading(false) }
  }

  const fillDemo = () => {
    setMode('login')
    setEmail('demo@invictus.ai')
    setPassword('demo1234')
    setErr(''); setOk('')
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

      {/* right */}
      <div className="flex items-center justify-center p-6 md:p-10 bg-[#0A0F1E] lg:border-l border-white/10">
        <div className="w-full max-w-[420px]">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 grid place-items-center"><Mountain className="w-5 h-5 text-black" /></div>
            <div><div className="font-display font-bold">INVICTUS</div><div className="text-xs text-white/50">AI SAFETY EVALUATOR</div></div>
          </div>

          <div className="rounded-[24px] bg-white p-7 md:p-8 shadow-card text-black">
            {/* tabs */}
            <div className="flex p-1 rounded-full bg-black/[0.06] border border-black/10 w-fit">
              <button
                onClick={() => { setMode('login'); setErr(''); setOk('') }}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition ${mode === 'login' ? 'bg-black text-white shadow' : 'text-black/60 hover:text-black'}`}
              >Sign in</button>
              <button
                onClick={() => { setMode('signup'); setErr(''); setOk('') }}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition ${mode === 'signup' ? 'bg-black text-white shadow' : 'text-black/60 hover:text-black'}`}
              >Create account</button>
            </div>

            <h2 className="font-display text-2xl font-bold mt-5">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
            <p className="text-sm text-black/60 mt-1">{mode === 'login' ? 'Use demo credentials or your own account.' : 'Start your first ascent — free, no card required.'}</p>

            {/* demo banner */}
            <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-3 flex items-start gap-3 text-sm">
              <Sparkles className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <div className="font-medium">Demo access</div>
                <div className="text-black/60 text-xs mt-1">Email: <b>demo@invictus.ai</b> • Password: <b>demo1234</b> — pre-seeded with targets & history.</div>
                {mode === 'login' && <button onClick={fillDemo} className="mt-2 text-xs px-3 py-1 rounded-full bg-black text-white font-medium">Fill demo credentials</button>}
              </div>
            </div>

            <form onSubmit={submit} className="mt-6 space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="text-xs font-semibold tracking-wide text-black/60">FULL NAME</label>
                  <div className="mt-1 flex items-center gap-2 px-3 py-3 rounded-xl bg-black/[0.04] border border-black/10 focus-within:border-black/20 focus-within:bg-white">
                    <User className="w-4 h-4 text-black/40" />
                    <input value={name} onChange={e => setName(e.target.value)} placeholder="Ada Lovelace" required={mode === 'signup'} className="flex-1 bg-transparent outline-none text-sm" />
                  </div>
                </div>
              )}
              <div>
                <label className="text-xs font-semibold tracking-wide text-black/60">EMAIL</label>
                <div className="mt-1 flex items-center gap-2 px-3 py-3 rounded-xl bg-black/[0.04] border border-black/10 focus-within:border-black/20 focus-within:bg-white">
                  <Mail className="w-4 h-4 text-black/40" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@team.ai" required className="flex-1 bg-transparent outline-none text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold tracking-wide text-black/60">PASSWORD</label>
                <div className="mt-1 flex items-center gap-2 px-3 py-3 rounded-xl bg-black/[0.04] border border-black/10 focus-within:border-black/20 focus-within:bg-white">
                  <Lock className="w-4 h-4 text-black/40" />
                  <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required className="flex-1 bg-transparent outline-none text-sm" />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="p-1 hover:bg-black/5 rounded-lg">
                    {showPass ? <EyeOff className="w-4 h-4 text-black/40" /> : <Eye className="w-4 h-4 text-black/40" />}
                  </button>
                </div>
                {mode === 'signup' && <div className="text-xs text-black/40 mt-1">Minimum 4 characters — use a strong password for production.</div>}
              </div>

              {err && <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5"><AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /><span>{err}</span></div>}
              {ok && <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5"><CheckCircle2 className="w-4 h-4 shrink-0" />{ok}</div>}

              <button disabled={loading} type="submit" className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-full bg-black text-white font-semibold hover:bg-black/90 disabled:opacity-60 disabled:cursor-not-allowed">
                {loading ? (mode === 'login' ? 'Signing in…' : 'Creating account…') : (mode === 'login' ? 'Sign in' : 'Create account')} <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center text-xs text-black/50">
                {mode === 'login' ? (
                  <>New here? <button type="button" onClick={() => { setMode('signup'); setErr(''); setOk('') }} className="underline font-semibold text-black hover:text-black/80">Create an account</button></>
                ) : (
                  <>Already have an account? <button type="button" onClick={() => { setMode('login'); setErr(''); setOk('') }} className="underline font-semibold text-black hover:text-black/80">Sign in</button></>
                )}
              </div>
            </form>

            <div className="mt-6 flex items-center gap-2 text-xs text-black/40">
              <ShieldCheck className="w-3.5 h-3.5" /> Audit-logged • Encrypted • Private network • RBAC
            </div>
          </div>

          <div className="text-center text-xs text-white/40 mt-6">By continuing you confirm you are authorized to test only your own systems.</div>
        </div>
      </div>
    </div>
  )
}
