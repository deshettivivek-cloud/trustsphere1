import { useState } from "react"
import { supabase } from "../lib/supabase"
import { useNavigate, Link } from "react-router-dom"
import toast from "react-hot-toast"
import logo from '../assets/logo.jpg'

export default function CustomerRegister() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ full_name: "", email: "", password: "", phone: "", city: "" })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const validate = () => {
    let err = {}
    if (!form.full_name) err.full_name = "Full name required"
    if (!form.email) err.email = "Email required"
    if (!form.password || form.password.length < 6) err.password = "Password must be at least 6 characters"
    if (!form.phone) err.phone = "Phone required"
    if (!form.city) err.city = "City required"
    return err
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return }
    setLoading(true); setError("")

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email, password: form.password,
        options: { data: { full_name: form.full_name, phone: form.phone, city: form.city, role: "customer" } },
      })
      if (signUpError) throw signUpError
      if (!data.user) throw new Error("User creation failed")

      const { error: profileError } = await supabase.from("profiles").upsert({
        id: data.user.id, full_name: form.full_name, phone: form.phone, city: form.city, role: "customer", email: form.email,
      })
      if (profileError) throw profileError

      toast.success("Account created! 🎉")
      navigate("/dashboard/customer")
    } catch (err) {
      let msg = err.message || "Registration failed."
      if (msg.includes("fetch")) msg = "Network error — check your internet connection."
      else if (msg.includes("rate") || msg.includes("limit")) msg = "Too many attempts. Please wait."
      else if (msg.includes("already registered")) msg = "This email is already registered."
      setError(msg); toast.error(msg)
    } finally { setLoading(false) }
  }

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/create-profile` } })
      if (error) throw error
    } catch (err) { toast.error(err.message || 'Google sign-in failed') }
  }

  const ic = (f) => `w-full px-4 py-2.5 rounded-lg bg-gray-800 border ${errors[f] ? "border-red-500" : "border-gray-700"} text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition`

  return (
    <div className="min-h-screen bg-[#0b1120] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-20 left-20 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-20 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-slate-800/60 backdrop-blur-sm border border-white/10 rounded-2xl shadow-2xl p-8">
          <div className="mb-6 text-center">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <img src={logo} alt="InLocFix" className="h-10 w-auto object-contain rounded-lg" />
            </Link>
            <h2 className="text-3xl font-bold text-white">Create Customer Account</h2>
            <p className="text-slate-400 mt-1 text-sm">Join InLocFix to find trusted service workers</p>
          </div>

          {/* Role badge */}
          <div className="flex items-center justify-center mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium">
              👤 Registering as Customer
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input type="text" placeholder="Full Name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className={ic("full_name")} />
              {errors.full_name && <p className="text-red-400 text-xs mt-1">{errors.full_name}</p>}
            </div>
            <div>
              <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={ic("email")} />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <div className="flex">
                <span className="px-3 py-2.5 bg-gray-700 border border-gray-700 border-r-0 rounded-l-lg text-gray-300 text-sm">+91</span>
                <input type="tel" placeholder="Phone Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className={`flex-1 px-4 py-2.5 rounded-r-lg bg-gray-800 border ${errors.phone ? "border-red-500" : "border-gray-700"} text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition`} />
              </div>
              {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
            </div>
            <div>
              <input type="text" placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={ic("city")} />
              {errors.city && <p className="text-red-400 text-xs mt-1">{errors.city}</p>}
            </div>
            <div>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} placeholder="Password (min 6 chars)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={ic("password")} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-sm">
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
            </div>

            {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3"><p className="text-red-400 text-sm">{error}</p></div>}

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-300 mt-2 shadow-lg shadow-blue-500/20">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                  Creating account...
                </span>
              ) : "Create Account"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5"><div className="flex-1 h-px bg-gray-700" /><span className="text-gray-500 text-xs uppercase">or</span><div className="flex-1 h-px bg-gray-700" /></div>

          <button type="button" onClick={handleGoogleSignIn}
            className="w-full py-3 bg-white hover:bg-gray-100 text-gray-800 font-semibold rounded-lg transition flex items-center justify-center gap-3 cursor-pointer">
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Sign up with Google
          </button>

          <div className="mt-6 space-y-2 text-center">
            <p className="text-gray-400 text-sm">Already have an account?{" "}<Link to="/login/customer" className="text-blue-400 hover:text-blue-300 font-medium">Sign in</Link></p>
            <p className="text-gray-500 text-xs">Want to offer services?{" "}<Link to="/register/worker" className="text-green-400 hover:text-green-300 font-medium">Register as Worker →</Link></p>
          </div>
        </div>
      </div>
    </div>
  )
}
