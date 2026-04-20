// src/pages/Dashboard.jsx

import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import MapplsMap from '../components/MapplsMap'
import {
  User, Briefcase, Calendar, Star, Search,
  AlertCircle, Plus, Shield, LogOut, ChevronRight,
  Clock, MapPin, Phone, Mail, CheckCircle, XCircle, Navigation
} from 'lucide-react'

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [workerProfile, setWorkerProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileNotFound, setProfileNotFound] = useState(false)

  // Tab state
  const [activeTab, setActiveTab] = useState('overview')

  // Bookings state
  const [bookings, setBookings] = useState([])
  const [bookingsLoading, setBookingsLoading] = useState(false)

  // Direct profile fetch with timeout protection
  useEffect(() => {
    if (authLoading) return
    let cancelled = false
    const fetchData = async () => {
      setLoading(true)
      try {
        const { data: { session } } = await Promise.race([
          supabase.auth.getSession(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000)),
        ])
        if (cancelled) return
        if (!session) { navigate('/login'); return }

        const { data: p, error } = await supabase
          .from('profiles').select('*').eq('id', session.user.id).single()
        if (cancelled) return
        if (error || !p) { setProfileNotFound(true); return }
        setProfile(p)

        if (p.role === 'service_worker') {
          const { data: wp } = await supabase
            .from('worker_profiles').select('*').eq('user_id', session.user.id).single()
          if (wp) setWorkerProfile(wp)
        }
      } catch (err) {
        console.error('[Dashboard]', err.message)
        if (!cancelled) setProfileNotFound(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchData()
    const timer = setTimeout(() => { if (!cancelled) setLoading(false) }, 5000)
    return () => { cancelled = true; clearTimeout(timer) }
  }, [authLoading, user])

  // Fetch bookings when tab changes to "bookings"
  useEffect(() => {
    if (activeTab !== 'bookings' || !profile || !user) return
    const fetchBookings = async () => {
      setBookingsLoading(true)
      try {
        const isWorker = profile.role === 'service_worker'
        const col = isWorker ? 'worker_id' : 'customer_id'

        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .eq(col, user.id)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Bookings fetch:', error.message)
          setBookings([])
          return
        }

        // For each booking, fetch the other party's name
        const enriched = await Promise.all(
          (data || []).map(async (b) => {
            const otherId = isWorker ? b.customer_id : b.worker_id
            if (!otherId) return { ...b, other_name: 'Unknown' }
            const { data: prof } = await supabase
              .from('profiles')
              .select('full_name, phone')
              .eq('id', otherId)
              .maybeSingle()
            return {
              ...b,
              other_name: prof?.full_name || 'Unknown',
              other_phone: prof?.phone || '',
            }
          })
        )
        setBookings(enriched)
      } catch (err) {
        console.error('Bookings error:', err)
      } finally {
        setBookingsLoading(false)
      }
    }
    fetchBookings()
  }, [activeTab, profile, user])

  const handleSignOut = async () => {
    try {
      await Promise.race([
        supabase.auth.signOut(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000)),
      ])
    } catch (err) {
      console.error(err)
      Object.keys(localStorage).forEach((k) => {
        if (k.startsWith('sb-')) localStorage.removeItem(k)
      })
    } finally {
      navigate('/login')
      window.location.reload()
    }
  }

  // Update booking status (for workers)
  const updateBookingStatus = async (bookingId, status) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId)
    if (!error) {
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b))
    }
  }

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b1120]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (profileNotFound || !profile) {
    return (
      <div className="min-h-screen bg-[#0b1120] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-slate-800/60 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mx-auto mb-5">
            <AlertCircle size={28} className="text-yellow-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Profile Not Found</h2>
          <p className="text-slate-400 text-sm mb-6">Your account exists but no profile has been set up yet.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button type="button" onClick={() => navigate('/create-profile')}
              className="px-5 py-2.5 bg-green-500 hover:bg-green-400 text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer">
              <Plus size={16} /> Create Profile
            </button>
            <button type="button" onClick={handleSignOut}
              className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer">
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>
      </div>
    )
  }

  const isWorker = profile.role === 'service_worker'
  const roleLabel = isWorker ? '🔧 Service Worker' : '👤 Customer'
  const roleBadgeClass = isWorker
    ? 'bg-green-500/20 text-green-400 border-green-500/30'
    : 'bg-blue-500/20 text-blue-400 border-blue-500/30'

  const TABS = isWorker
    ? [
        { id: 'overview', label: 'My Profile', icon: Briefcase },
        { id: 'bookings', label: 'Job Requests', icon: Calendar },
        { id: 'account', label: 'Account', icon: User },
      ]
    : [
        { id: 'overview', label: 'Overview', icon: Search },
        { id: 'bookings', label: 'My Bookings', icon: Calendar },
        { id: 'account', label: 'Account', icon: User },
      ]

  const statusColor = (s) => {
    if (s === 'confirmed') return 'bg-green-500/20 text-green-400'
    if (s === 'cancelled') return 'bg-red-500/20 text-red-400'
    return 'bg-yellow-500/20 text-yellow-400'
  }

  return (
    <div className="min-h-screen bg-[#0b1120]">
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Profile Header */}
        <div className="relative bg-gradient-to-br from-slate-800 via-slate-800 to-green-900/40 border border-white/10 rounded-2xl p-6 mb-6 overflow-hidden">
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          <div className="relative flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-green-500/20 shrink-0">
              {profile.full_name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-green-400 text-xs font-medium mb-0.5">Welcome back,</p>
              <h1 className="text-xl md:text-2xl font-bold text-white truncate">{profile.full_name}</h1>
              <span className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full mt-1.5 border ${roleBadgeClass}`}>
                {roleLabel}
              </span>
            </div>
            <button type="button" onClick={handleSignOut}
              className="shrink-0 px-4 py-2 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 text-slate-400 hover:text-red-400 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer">
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-6 bg-slate-800/40 p-1 rounded-xl border border-white/5">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} type="button" onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition cursor-pointer ${
                activeTab === id
                  ? 'bg-green-500/15 text-green-400 border border-green-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}>
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {/* ========== OVERVIEW TAB ========== */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Your Info */}
            <div className="bg-slate-800/60 border border-white/5 rounded-2xl p-6">
              <h2 className="font-bold text-white mb-4 flex items-center gap-2">
                <Shield size={16} className="text-green-400" /> Your Info
              </h2>
              <div className="space-y-0">
                {[
                  { icon: Mail, label: 'Email', value: profile.email || user?.email || 'Not set' },
                  { icon: Phone, label: 'Phone', value: profile.phone || 'Not set' },
                  { icon: MapPin, label: 'City', value: profile.city || 'Not set' },
                  { icon: User, label: 'Account Type', value: isWorker ? 'Service Worker' : 'Customer' },
                ].map(({ icon: Ic, label, value }) => (
                  <div key={label} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                    <span className="text-sm text-slate-500 flex items-center gap-2"><Ic size={13} />{label}</span>
                    <span className="text-sm font-medium text-slate-300">{value}</span>
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => navigate('/create-profile')}
                className="mt-4 w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-xl text-sm font-medium transition flex items-center justify-center gap-2 cursor-pointer">
                Edit Profile <ChevronRight size={14} />
              </button>
            </div>

            {/* Role-specific content */}
            {isWorker ? (
              <div className="bg-slate-800/60 border border-white/5 rounded-2xl p-6">
                <h2 className="font-bold text-white mb-4 flex items-center gap-2">
                  <Briefcase size={16} className="text-green-400" /> Worker Details
                </h2>
                {workerProfile ? (
                  <div className="space-y-0">
                    {[
                      { label: 'Service', value: workerProfile.service_type || 'Not set' },
                      { label: 'Location', value: workerProfile.location || profile.city || 'Not set' },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                        <span className="text-sm text-slate-500">{label}</span>
                        <span className="text-sm font-medium text-slate-300 capitalize">{value}</span>
                      </div>
                    ))}
                    <Link to="/create-profile" className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 rounded-xl text-sm font-semibold transition-colors">
                      Edit Profile <ChevronRight size={14} />
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-400 text-sm mb-4">You haven't set up your worker profile yet.</p>
                    <Link to="/create-profile" className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-500 hover:bg-green-400 text-white font-semibold rounded-xl text-sm transition-colors">
                      <Plus size={16} /> Set Up Profile
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-800/60 border border-white/5 rounded-2xl p-6">
                <h2 className="font-bold text-white mb-4 flex items-center gap-2">
                  <Search size={16} className="text-green-400" /> Quick Search
                </h2>
                <p className="text-slate-400 text-sm mb-5">Find trusted service workers near you.</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: '⚡', label: 'Electrician' },
                    { icon: '🔧', label: 'Plumber' },
                    { icon: '❄️', label: 'AC Repair' },
                    { icon: '🪚', label: 'Carpenter' },
                    { icon: '🎨', label: 'Painter' },
                    { icon: '📱', label: 'Technician' },
                  ].map(({ icon, label }) => (
                    <Link key={label} to={`/search?service=${label.toLowerCase()}`}
                      className="flex items-center gap-2.5 px-3.5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl transition-all text-sm">
                      <span className="text-base">{icon}</span>
                      <span className="text-slate-300 font-medium">{label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========== BOOKINGS TAB ========== */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-white">
                {isWorker ? 'Job Requests' : 'My Bookings'}
              </h2>
              {!isWorker && (
                <Link to="/search" className="text-green-400 text-sm font-medium hover:text-green-300 flex items-center gap-1">
                  Find Workers <ChevronRight size={14} />
                </Link>
              )}
            </div>

            {bookingsLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : bookings.length === 0 ? (
              <div className="bg-slate-800/60 border border-white/5 rounded-2xl p-8 text-center">
                <Calendar size={32} className="text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">
                  {isWorker ? 'No job requests yet. Your bookings will appear here.' : 'No bookings yet.'}
                </p>
                {!isWorker && (
                  <Link to="/search" className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-green-500 hover:bg-green-400 text-white font-semibold rounded-xl text-sm transition">
                    <Search size={15} /> Find Workers
                  </Link>
                )}
              </div>
            ) : (
              bookings.map((b) => (
                <div key={b.id} className="bg-slate-800/60 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shrink-0 mt-0.5">
                        {b.other_name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-semibold text-sm truncate">{b.other_name}</p>
                        <p className="text-green-400 text-xs capitalize mt-0.5">{b.service_type || 'Service'}</p>
                        {b.other_phone && (
                          <p className="text-slate-500 text-xs mt-0.5 flex items-center gap-1">
                            <Phone size={10} /> {b.other_phone}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium capitalize shrink-0 ${statusColor(b.status)}`}>
                      {b.status || 'pending'}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5">
                    <span className="text-slate-400 text-xs flex items-center gap-1.5">
                      <Calendar size={12} /> {b.booking_date || 'No date'}
                    </span>
                    <span className="text-slate-400 text-xs flex items-center gap-1.5">
                      <Clock size={12} /> {b.time_slot || 'No time'}
                    </span>
                  </div>

                  {b.note && (
                    <p className="mt-2 text-slate-500 text-xs italic">"{b.note}"</p>
                  )}

                  {/* Customer location & navigate */}
                  {b.customer_address && (
                    <div className="mt-2 flex items-start gap-1.5">
                      <MapPin size={11} className="text-blue-400 shrink-0 mt-0.5" />
                      <p className="text-slate-400 text-xs truncate flex-1" title={b.customer_address}>
                        {b.customer_address}
                      </p>
                    </div>
                  )}

                  {/* Embedded Mappls Map showing customer location */}
                  {isWorker && b.customer_lat && b.customer_lng && (
                    <div className="mt-2 rounded-lg overflow-hidden border border-white/10">
                      <MapplsMap
                        center={{ lat: Number(b.customer_lat), lng: Number(b.customer_lng) }}
                        markerPosition={{ lat: Number(b.customer_lat), lng: Number(b.customer_lng) }}
                        zoom={14}
                        interactive={false}
                        style={{ width: '100%', height: '120px', borderRadius: '8px' }}
                      />
                    </div>
                  )}

                  {/* Navigate button for workers — only after accepting */}
                  {isWorker && b.status === 'confirmed' && (b.customer_lat || b.customer_address) && (
                    <a
                      href={b.customer_lat && b.customer_lng
                        ? `https://mappls.com/navigation?places=${b.customer_lat},${b.customer_lng},Customer&isNav=true&mode=driving`
                        : `https://mappls.com/navigation?places=${encodeURIComponent(b.customer_address)}&isNav=true&mode=driving`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 w-full py-2.5 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5"
                    >
                      <Navigation size={13} /> 🗺️ Navigate to Customer (MapmyIndia)
                    </a>
                  )}

                  {/* Worker actions: accept/decline */}
                  {isWorker && b.status === 'pending' && (
                    <div className="flex gap-2 mt-3">
                      <button type="button" onClick={() => updateBookingStatus(b.id, 'confirmed')}
                        className="flex-1 py-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 rounded-lg text-xs font-medium transition cursor-pointer flex items-center justify-center gap-1.5">
                        <CheckCircle size={13} /> Accept
                      </button>
                      <button type="button" onClick={() => updateBookingStatus(b.id, 'cancelled')}
                        className="flex-1 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg text-xs font-medium transition cursor-pointer flex items-center justify-center gap-1.5">
                        <XCircle size={13} /> Decline
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ========== ACCOUNT TAB ========== */}
        {activeTab === 'account' && (
          <div className="max-w-lg mx-auto space-y-4">
            <div className="bg-slate-800/60 border border-white/5 rounded-2xl p-6">
              <h2 className="font-bold text-white mb-5 flex items-center gap-2">
                <User size={16} className="text-green-400" /> Account Settings
              </h2>

              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl mb-5">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-xl shrink-0">
                  {profile.full_name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                  <p className="text-white font-semibold">{profile.full_name}</p>
                  <p className="text-slate-400 text-sm">{profile.email || user?.email}</p>
                  <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full mt-1 font-medium ${roleBadgeClass}`}>
                    {isWorker ? '🔧 Worker' : '👤 Customer'}
                  </span>
                </div>
              </div>

              <div className="space-y-0">
                {[
                  { label: 'Full Name', value: profile.full_name },
                  { label: 'Email', value: profile.email || user?.email },
                  { label: 'Phone', value: profile.phone || 'Not set' },
                  { label: 'City', value: profile.city || 'Not set' },
                  { label: 'Role', value: isWorker ? 'Service Worker' : 'Customer' },
                  ...(workerProfile ? [
                    { label: 'Service Type', value: workerProfile.service_type },
                    { label: 'Work Location', value: workerProfile.location },
                  ] : []),
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                    <span className="text-sm text-slate-500">{label}</span>
                    <span className="text-sm font-medium text-slate-300 capitalize">{value}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mt-5">
                <button type="button" onClick={() => navigate('/create-profile')}
                  className="flex-1 py-2.5 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 rounded-xl text-sm font-semibold transition cursor-pointer">
                  Edit Profile
                </button>
                <button type="button" onClick={handleSignOut}
                  className="flex-1 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-xl text-sm font-semibold transition cursor-pointer">
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}