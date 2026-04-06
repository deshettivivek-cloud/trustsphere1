import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { Eye, EyeOff, User, Briefcase } from 'lucide-react'

const SERVICE_TYPES = ['Electrician','Plumber','AC Repair','Carpenter','Painter','Technician','Cleaner','Other']

export default function Register() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState('customer')
  const [form, setForm] = useState({ full_name: '', email: '', password: '', phone: '', city: '', service_type: '' })
  const [errors, setErrors] = useState({})

  const validate = () => {
    const newErrors = {}
    if (!form.full_name.trim()) newErrors.full_name = 'Full name is required'
    if (!form.email.trim()) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Invalid email'
    if (!form.password) newErrors.password = 'Password is required'
    else if (form.password.length < 6) newErrors.password = 'Min 6 characters'
    if (!form.phone.trim()) newErrors.phone = 'Phone is required'
    else if (!/^[6-9]\d{9}$/.test(form.phone)) newErrors.phone = 'Invalid Indian phone number'
    if (!form.city.trim()) newErrors.city = 'City is required'
    if (role === 'worker' && !form.service_type) newErrors.service_type = 'Select a service type'
    return newErrors
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return }

    setLoading(true)
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      })
      if (authError) throw authError

      await api.post('/auth/profile', {
        full_name: form.full_name,
        phone: form.phone,
        city: form.city,
        role,
      })

      if (role === 'worker') {
        const { error: wpError } = await supabase
          .from('worker_profiles')
          .insert([{ user_id: authData.user.id, service_type: form.service_type, location: form.city }])
        if (wpError) throw wpError
      }

      toast.success('Account created! Welcome to TrustSphere 🎉')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <span className="font-display font-bold text-slate-900 text-xl">TrustSphere</span>
          </Link>
          <h1 className="text-2xl font-display font-bold text-slate-900">Create your account</h1>
          <p className="text-slate-500 text-sm mt-1">Join thousands of users on TrustSphere</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          {/* Role Toggle */}
          <div className="flex gap-2 p-1 bg-slate-100 rounded-xl mb-6">
            <button type="button" onClick={() => setRole('customer')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${role === 'customer' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>
              <User size={15} /> Customer
            </button>
            <button type="button" onClick={() => setRole('worker')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${role === 'worker' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>
              <Briefcase size={15} /> Service Worker
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { name: 'full_name', label: 'Full Name', placeholder: 'Rahul Sharma', type: 'text' },
              { name: 'email', label: 'Email', placeholder: 'you@example.com', type: 'email' },
              { name: 'city', label: 'City', placeholder: 'Hyderabad', type: 'text' },
            ].map(({ name, label, placeholder, type }) => (
              <div key={name}>
                <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
                <input name={name} type={type} value={form[name]} onChange={handleChange} placeholder={placeholder}
                  className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors ${errors[name] ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:border-green-400'}`} />
                {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]}</p>}
              </div>
            ))}

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
              <div className="flex gap-2">
                <span className="flex items-center px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-500">+91</span>
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="9876543210" maxLength={10}
                  className={`flex-1 px-4 py-3 rounded-xl border text-sm outline-none transition-colors ${errors.phone ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:border-green-400'}`} />
              </div>
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <input name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange} placeholder="Min 6 characters"
                  className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors pr-10 ${errors.password ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:border-green-400'}`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* Service Type - workers only */}
            {role === 'worker' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Service Type</label>
                <select name="service_type" value={form.service_type} onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border text-sm outline-none bg-white ${errors.service_type ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:border-green-400'}`}>
                  <option value="">Select your service</option>
                  {SERVICE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.service_type && <p className="text-red-500 text-xs mt-1">{errors.service_type}</p>}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-semibold py-3 rounded-xl transition-colors mt-2">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-green-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}