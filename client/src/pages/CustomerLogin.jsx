import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Phone, Mail, ArrowRight } from 'lucide-react'
import { API_BASE_URL } from '../lib/capacitor'
import logo from '../assets/logo.jpg'

export default function CustomerLogin() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loginMode, setLoginMode] = useState('email')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpError, setOtpError] = useState('')

  const validate = () => {
    const e = {}
    if (!form.email.trim()) e.email = 'Email is required'
    if (!form.password) e.password = 'Password is required'
    return e
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const v = validate()
    if (Object.keys(v).length > 0) { setErrors(v); return }
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password })
      if (error) throw error
      toast.success('Welcome back! 👋')
      navigate('/dashboard/customer')
    } catch (err) { toast.error(err.message || 'Invalid email or password') }
    finally { setLoading(false) }
  }

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/dashboard/customer` } })
      if (error) throw error
    } catch (err) { toast.error(err.message || 'Google sign-in failed') }
  }

  const handleSendOtp = async () => {
    const p = phone.replace(/\s+/g, '').replace(/^\+91/, '')
    if (!p || p.length < 10) { setOtpError('Enter a valid 10-digit phone number'); return }
    setOtpLoading(true); setOtpError('')
    try {
      const res = await fetch(`${API_BASE_URL}/api/otp/send`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: p }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to send OTP')
      setOtpSent(true); toast.success(data.message || 'OTP sent!')
    } catch (err) { setOtpError(err.message); toast.error(err.message) }
    finally { setOtpLoading(false) }
  }

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 6) { setOtpError('Enter the 6-digit OTP'); return }
    const p = phone.replace(/\s+/g, '').replace(/^\+91/, '')
    setOtpLoading(true); setOtpError('')
    try {
      const res = await fetch(`${API_BASE_URL}/api/otp/verify`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: p, otp }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'OTP verification failed')
      localStorage.setItem('trustsphere_otp_user', JSON.stringify(data.user))
      localStorage.setItem('trustsphere_otp_token', data.token)
      toast.success('Welcome back! 👋')
      window.location.href = '/dashboard/customer'
    } catch (err) { setOtpError(err.message); toast.error(err.message) }
    finally { setOtpLoading(false) }
  }

  const ic = (f) => `w-full px-4 py-2.5 rounded-lg bg-gray-800 border ${errors[f] ? 'border-red-500' : 'border-gray-700'} text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition`

  const Spinner = () => (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  )

  return (
    <div className="min-h-screen bg-[#0b1120] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-20 right-20 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-20 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-slate-800/60 backdrop-blur-sm border border-white/10 rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <img src={logo} alt="InLocFix" className="h-10 w-auto object-contain rounded-lg" />
            </Link>
            <h1 className="text-3xl font-bold text-white">Customer Sign In</h1>
            <p className="text-slate-400 text-sm mt-1">Welcome back! Find trusted workers near you</p>
          </div>

          {/* Mode toggle */}
          <div className="flex rounded-lg overflow-hidden border border-gray-700 mb-6">
            <button type="button" onClick={() => { setLoginMode('email'); setOtpSent(false); setOtpError('') }}
              className={`flex-1 py-2.5 text-sm font-medium transition flex items-center justify-center gap-2 ${loginMode === 'email' ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
              <Mail size={15} /> Email
            </button>
            <button type="button" onClick={() => { setLoginMode('phone'); setOtpError('') }}
              className={`flex-1 py-2.5 text-sm font-medium transition flex items-center justify-center gap-2 ${loginMode === 'phone' ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
              <Phone size={15} /> Phone OTP
            </button>
          </div>

          {loginMode === 'email' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" className={ic('email')} />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                <div className="relative">
                  <input name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange} placeholder="Your password" className={`${ic('password')} pr-10`} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
              </div>
              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-blue-400 hover:text-blue-300 text-xs font-medium transition">Forgot Password?</Link>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-300 mt-2 shadow-lg shadow-blue-500/20">
                {loading ? <span className="flex items-center justify-center gap-2"><Spinner />Signing in...</span> : 'Sign In'}
              </button>
            </form>
          )}

          {loginMode === 'phone' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Phone Number</label>
                <div className="flex">
                  <span className="px-3 py-2.5 bg-gray-700 border border-gray-700 border-r-0 rounded-l-lg text-gray-300 text-sm flex items-center">+91</span>
                  <input type="tel" maxLength={10} value={phone} onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '')); setOtpError('') }}
                    placeholder="Enter 10-digit number" disabled={otpSent}
                    className={`flex-1 px-4 py-2.5 rounded-r-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition ${otpSent ? 'opacity-60' : ''}`} />
                </div>
              </div>
              {otpSent && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Enter OTP</label>
                  <input type="text" maxLength={6} value={otp} onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '')); setOtpError('') }}
                    placeholder="6-digit code" className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition text-center tracking-[0.5em] text-lg font-mono" autoFocus />
                </div>
              )}
              {otpError && <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2.5"><p className="text-red-400 text-sm">{otpError}</p></div>}
              {!otpSent ? (
                <button type="button" onClick={handleSendOtp} disabled={otpLoading || phone.length < 10}
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20">
                  {otpLoading ? <span className="flex items-center justify-center gap-2"><Spinner />Sending OTP...</span> : <>Send OTP <ArrowRight size={16} /></>}
                </button>
              ) : (
                <div className="space-y-3">
                  <button type="button" onClick={handleVerifyOtp} disabled={otpLoading || otp.length < 6}
                    className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20">
                    {otpLoading ? <span className="flex items-center justify-center gap-2"><Spinner />Verifying...</span> : <>Verify & Sign In <ArrowRight size={16} /></>}
                  </button>
                  <button type="button" onClick={() => { setOtpSent(false); setOtp(''); setOtpError('') }}
                    className="w-full py-2 text-gray-400 hover:text-white text-sm font-medium transition">← Change number / Resend OTP</button>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-3 my-5"><div className="flex-1 h-px bg-gray-700" /><span className="text-gray-500 text-xs uppercase">or</span><div className="flex-1 h-px bg-gray-700" /></div>

          <button type="button" onClick={handleGoogleSignIn}
            className="w-full py-3 bg-white hover:bg-gray-100 text-gray-800 font-semibold rounded-lg transition flex items-center justify-center gap-3 cursor-pointer">
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </button>

          <div className="mt-6 space-y-2 text-center">
            <p className="text-gray-400 text-sm">Don't have an account?{' '}<Link to="/register/customer" className="text-blue-400 hover:text-blue-300 font-medium">Register as Customer</Link></p>
            <p className="text-gray-500 text-xs">Are you a service worker?{' '}<Link to="/login/worker" className="text-green-400 hover:text-green-300 font-medium">Sign in as Worker →</Link></p>
          </div>
        </div>
      </div>
    </div>
  )
}
