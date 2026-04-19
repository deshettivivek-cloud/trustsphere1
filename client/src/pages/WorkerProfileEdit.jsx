import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { Briefcase, MapPin, Clock, DollarSign, Save, ToggleLeft, ToggleRight } from 'lucide-react'

const SERVICE_TYPES = ['Electrician','Plumber','AC Repair','Carpenter','Painter','Technician','Cleaner','Other']
const SKILLS_LIST = ['Wiring','Pipe Fitting','AC Installation','Woodwork','Wall Painting','Mobile Repair','Appliance Repair','Tiling','Welding','Plumbing']

export default function WorkerProfileEdit() {
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [isAvailable, setIsAvailable] = useState(true)
  const [form, setForm] = useState({
    bio: '',
    service_type: '',
    experience_years: '',
    hourly_rate: '',
    location: '',
    skills: [],
  })

  // Load existing worker profile
  useEffect(() => {
    const fetchWorkerProfile = async () => {
      if (!user) return
      const { data } = await supabase
        .from('worker_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (data) {
        setForm({
          bio: data.bio || '',
          service_type: data.service_type || '',
          experience_years: data.experience_years || '',
          hourly_rate: data.hourly_rate || '',
          location: data.location || '',
          skills: data.skills || [],
        })
        setIsAvailable(data.is_available)
      }
      setFetchLoading(false)
    }
    fetchWorkerProfile()
  }, [user])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const toggleSkill = (skill) => {
    setForm(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }))
  }

  const handleAvailabilityToggle = async () => {
    try {
      await api.patch('/workers/availability', { is_available: !isAvailable })
      setIsAvailable(!isAvailable)
      toast.success(`You are now ${!isAvailable ? 'Available' : 'Unavailable'}`)
    } catch (err) {
      toast.error('Failed to update availability')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.put('/workers/profile', {
        ...form,
        experience_years: parseInt(form.experience_years) || 0,
        hourly_rate: parseFloat(form.hourly_rate) || 0,
      })
      toast.success('Profile updated successfully! ✅')
    } catch (err) {
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-display font-bold text-slate-900">My Worker Profile</h1>
          <p className="text-slate-500 text-sm mt-1">This is what customers see when they find you</p>
        </div>

        {/* Availability Toggle */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900">Availability Status</h3>
              <p className="text-slate-500 text-sm mt-0.5">
                {isAvailable ? '✅ You are visible to customers' : '❌ You are hidden from search'}
              </p>
            </div>
            <button
              onClick={handleAvailabilityToggle}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-colors ${
                isAvailable
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {isAvailable
                ? <><ToggleRight size={20} /> Available</>
                : <><ToggleLeft size={20} /> Unavailable</>
              }
            </button>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">

          {/* Service Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              <Briefcase size={14} className="inline mr-1" /> Service Type
            </label>
            <select
              name="service_type"
              value={form.service_type}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-green-400 text-sm outline-none bg-white"
            >
              <option value="">Select service</option>
              {SERVICE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              rows={3}
              placeholder="Tell customers about yourself, your experience, and what makes you great..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-green-400 text-sm outline-none resize-none"
            />
          </div>

          {/* Experience + Rate */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <Clock size={14} className="inline mr-1" /> Experience (years)
              </label>
              <input
                name="experience_years"
                type="number"
                min="0"
                max="50"
                value={form.experience_years}
                onChange={handleChange}
                placeholder="e.g. 5"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-green-400 text-sm outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <DollarSign size={14} className="inline mr-1" /> Hourly Rate (₹)
              </label>
              <input
                name="hourly_rate"
                type="number"
                min="0"
                value={form.hourly_rate}
                onChange={handleChange}
                placeholder="e.g. 500"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-green-400 text-sm outline-none"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              <MapPin size={14} className="inline mr-1" /> Location / Area
            </label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="e.g. Hyderabad, Telangana"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-green-400 text-sm outline-none"
            />
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Skills</label>
            <div className="flex flex-wrap gap-2">
              {SKILLS_LIST.map(skill => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                    form.skills.includes(skill)
                      ? 'bg-green-500 text-white border-green-500'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-green-300'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            <Save size={16} />
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  )
}