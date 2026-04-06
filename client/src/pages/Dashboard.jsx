import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import { User, Briefcase, Calendar, Star, Settings } from 'lucide-react'

export default function Dashboard() {
  const { profile } = useAuth()

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-slate-900 to-green-900 text-white rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-green-400/20 border-2 border-green-400/40 flex items-center justify-center">
              <span className="text-2xl font-bold text-green-300">{profile.full_name?.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <p className="text-green-300 text-sm">Welcome back,</p>
              <h1 className="text-xl font-display font-bold">{profile.full_name}</h1>
              <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 ${profile.role === 'worker' ? 'bg-green-500/30 text-green-300' : 'bg-blue-500/30 text-blue-300'}`}>
                {profile.role === 'worker' ? '🔧 Service Worker' : '👤 Customer'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {profile.role === 'customer' ? (
            <>
              <Link to="/search" className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center gap-2 text-center">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center"><User size={20} className="text-green-600" /></div>
                <span className="text-sm font-semibold text-slate-700">Find Workers</span>
              </Link>
              <Link to="/my-bookings" className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center gap-2 text-center">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center"><Calendar size={20} className="text-blue-600" /></div>
                <span className="text-sm font-semibold text-slate-700">My Bookings</span>
              </Link>
            </>
          ) : (
            <>
              <Link to="/worker-profile" className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center gap-2 text-center">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center"><Briefcase size={20} className="text-green-600" /></div>
                <span className="text-sm font-semibold text-slate-700">My Profile</span>
              </Link>
              <Link to="/my-jobs" className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center gap-2 text-center">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center"><Calendar size={20} className="text-blue-600" /></div>
                <span className="text-sm font-semibold text-slate-700">Job Requests</span>
              </Link>
              <Link to="/my-reviews" className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center gap-2 text-center">
                <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center"><Star size={20} className="text-yellow-500" /></div>
                <span className="text-sm font-semibold text-slate-700">My Reviews</span>
              </Link>
            </>
          )}
          <Link to="/settings" className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center gap-2 text-center">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center"><Settings size={20} className="text-slate-500" /></div>
            <span className="text-sm font-semibold text-slate-700">Settings</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="font-display font-bold text-slate-900 mb-4">Your Info</h2>
          <div className="space-y-3">
            {[
              { label: 'Email', value: profile.email },
              { label: 'Phone', value: profile.phone || 'Not set' },
              { label: 'City', value: profile.city || 'Not set' },
              { label: 'Account Type', value: profile.role === 'worker' ? 'Service Worker' : 'Customer' },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <span className="text-sm text-slate-500">{label}</span>
                <span className="text-sm font-medium text-slate-800">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}