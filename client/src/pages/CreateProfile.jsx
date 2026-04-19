// src/pages/CreateProfile.jsx

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { User, Briefcase, MapPin, ChevronRight, LogOut } from 'lucide-react'

const SERVICE_TYPES = [
  'Electrician', 'Plumber', 'AC Repair', 'Carpenter',
  'Painter', 'Technician', 'Cleaner', 'Other'
]

export default function CreateProfile() {
  const { refetchProfile } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    city: '',
    role: 'customer',
    service_type: '',
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')

  // Pre-fill from existing profile row OR auth metadata
  useEffect(() => {
    const prefill = async () => {
      try {
        const { data: { session } } = await Promise.race([
          supabase.auth.getSession(),
          new Promise((_, reject) => setTimeout(() => reject('timeout'), 3000)),
        ])
        if (!session?.user) return

        // Try loading existing profile first
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle()

        if (existingProfile) {
          setForm(prev => ({
            ...prev,
            full_name: existingProfile.full_name || prev.full_name,
            phone: existingProfile.phone || prev.phone,
            city: existingProfile.city || prev.city,
            role: existingProfile.role || prev.role,
          }))

          // Also load worker profile if service_worker
          if (existingProfile.role === 'service_worker') {
            const { data: wp } = await supabase
              .from('worker_profiles')
              .select('*')
              .eq('user_id', session.user.id)
              .maybeSingle()
            if (wp) {
              setForm(prev => ({ ...prev, service_type: wp.service_type || prev.service_type }))
            }
          }
        } else {
          // Fallback: use auth metadata
          const meta = session.user.user_metadata || {}
          setForm(prev => ({
            ...prev,
            full_name: meta.full_name || prev.full_name,
            phone: meta.phone || prev.phone,
            city: meta.city || prev.city,
            role: meta.role || prev.role,
          }))
        }
      } catch (err) {
        console.error('Prefill error:', err)
      }
    }
    prefill()
  }, [])

  const validate = () => {
    const err = {}
    if (!form.full_name.trim()) err.full_name = 'Full name is required'
    if (!form.city.trim()) err.city = 'City / area is required'
    if (form.role === 'service_worker' && !form.service_type) err.service_type = 'Select a service type'
    return err
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
    if (submitError) setSubmitError('')
  }

  // --- CREATE PROFILE (onClick, no form tag) ---
  const handleCreateProfile = async () => {
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setLoading(true)
    setSubmitError('')

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast.error('Session expired. Please log in again.')
        navigate('/login')
        return
      }

      // Upsert into profiles (id = auth uid, NO user_id column)
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: session.user.id,
          full_name: form.full_name.trim(),
          phone: form.phone.trim(),
          city: form.city.trim(),
          role: form.role,
          email: session.user.email,
        })

      if (profileError) throw profileError

      // If service_worker, check-then-insert/update worker_profiles
      if (form.role === 'service_worker') {
        const { data: existingWp } = await supabase
          .from('worker_profiles')
          .select('id')
          .eq('user_id', session.user.id)
          .maybeSingle()

        if (existingWp) {
          const { error: wpErr } = await supabase
            .from('worker_profiles')
            .update({ service_type: form.service_type, location: form.city.trim() })
            .eq('user_id', session.user.id)
          if (wpErr) throw wpErr
        } else {
          const { error: wpErr } = await supabase
            .from('worker_profiles')
            .insert({
              user_id: session.user.id,
              service_type: form.service_type,
              location: form.city.trim(),
            })
          if (wpErr) throw wpErr
        }
      }

      toast.success('Profile created successfully! 🎉')

      // Refetch with timeout guard
      try {
        if (refetchProfile) {
          await Promise.race([
            refetchProfile(),
            new Promise((_, reject) => setTimeout(() => reject('timeout'), 3000))
          ])
        }
      } catch (_) { /* navigate anyway */ }

      navigate('/dashboard')

    } catch (err) {
      console.error('Create profile error:', err)
      const msg = err.message || 'Failed to create profile'
      setSubmitError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  // --- SIGN OUT: timeout-protected, never hangs ---
  const handleSignOut = async () => {
    try {
      await Promise.race([
        supabase.auth.signOut(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000)),
      ])
    } catch (err) {
      console.error('Sign out (forcing clear):', err)
      Object.keys(localStorage).forEach((k) => {
        if (k.startsWith('sb-')) localStorage.removeItem(k)
      })
    } finally {
      navigate('/login')
      window.location.reload()
    }
  }

  const inputClass = (field) =>
    `w-full px-4 py-3 rounded-xl bg-slate-800 border ${
      errors[field] ? 'border-red-500' : 'border-white/10'
    } text-white placeholder-slate-500 focus:outline-none focus:border-green-500/50 transition text-sm`

  return (
    <div className="min-h-screen bg-[#0b1120] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
            <User size={24} className="text-green-400" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Complete Your Profile</h1>
          <p className="text-slate-400 text-sm">Fill in your details to get started on TrustSphere</p>
        </div>

        {/* Card — no form tag, onClick handlers */}
        <div className="bg-slate-800/60 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-8 space-y-5">

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              <User size={13} className="inline mr-1.5 -mt-0.5" />
              Full Name
            </label>
            <input
              name="full_name"
              type="text"
              value={form.full_name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className={inputClass('full_name')}
            />
            {errors.full_name && <p className="text-red-400 text-xs mt-1">{errors.full_name}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Phone Number</label>
            <div className="flex">
              <span className="px-3 py-3 bg-slate-700 border border-white/10 border-r-0 rounded-l-xl text-slate-400 text-sm flex items-center">
                +91
              </span>
              <input
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="Phone number"
                className="flex-1 px-4 py-3 rounded-r-xl bg-slate-800 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-green-500/50 transition text-sm"
              />
            </div>
          </div>

          {/* City / Area */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              <MapPin size={13} className="inline mr-1.5 -mt-0.5" />
              City / Area
            </label>
            <input
              name="city"
              type="text"
              value={form.city}
              onChange={handleChange}
              placeholder="e.g. Hyderabad, Mumbai, Delhi..."
              className={inputClass('city')}
            />
            {errors.city && <p className="text-red-400 text-xs mt-1">{errors.city}</p>}
          </div>

          {/* Role Selector */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">I am a...</label>
            <div className="flex rounded-xl overflow-hidden border border-white/10">
              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, role: 'customer' }))}
                className={`flex-1 py-2.5 text-sm font-medium transition ${
                  form.role === 'customer'
                    ? 'bg-green-500 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                👤 Customer
              </button>
              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, role: 'service_worker' }))}
                className={`flex-1 py-2.5 text-sm font-medium transition ${
                  form.role === 'service_worker'
                    ? 'bg-green-500 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                🔧 Service Worker
              </button>
            </div>
          </div>

          {/* Service Type — only for service workers */}
          {form.role === 'service_worker' && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                <Briefcase size={13} className="inline mr-1.5 -mt-0.5" />
                Service Type
              </label>
              <select
                name="service_type"
                value={form.service_type}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl bg-slate-800 border ${
                  errors.service_type ? 'border-red-500' : 'border-white/10'
                } text-white focus:outline-none focus:border-green-500/50 transition text-sm`}
              >
                <option value="">Select your service</option>
                {SERVICE_TYPES.map(s => (
                  <option key={s} value={s.toLowerCase()}>{s}</option>
                ))}
              </select>
              {errors.service_type && <p className="text-red-400 text-xs mt-1">{errors.service_type}</p>}
            </div>
          )}

          {/* Error message */}
          {submitError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <p className="text-red-400 text-sm">{submitError}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="space-y-3 pt-1">
            <button
              type="button"
              onClick={handleCreateProfile}
              disabled={loading}
              className="w-full py-3 bg-green-500 hover:bg-green-400 disabled:bg-green-500/50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating profile...
                </>
              ) : (
                <>
                  Create Profile
                  <ChevronRight size={16} />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleSignOut}
              className="w-full py-2.5 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 text-slate-400 hover:text-red-400 font-medium rounded-xl transition flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              <LogOut size={15} />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
