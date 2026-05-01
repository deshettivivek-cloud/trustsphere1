// src/pages/Search.jsx — Urban Company-inspired worker booking UI

import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { API_BASE_URL } from '../lib/capacitor'
import {
  Search as SearchIcon, MapPin, Phone, Briefcase, Star,
  X, Clock, CalendarDays, CheckCircle, AlertCircle,
  Navigation, Loader2, Shield, ChevronRight, Sparkles, ThumbsUp
} from 'lucide-react'

const SERVICE_FILTERS = [
  { label: 'All', value: 'All Services', icon: '🔍' },
  { label: 'Electrician', value: 'Electrician', icon: '⚡' },
  { label: 'Plumber', value: 'Plumber', icon: '🔧' },
  { label: 'AC Repair', value: 'AC Repair', icon: '❄️' },
  { label: 'Carpenter', value: 'Carpenter', icon: '🪚' },
  { label: 'Painter', value: 'Painter', icon: '🎨' },
  { label: 'Technician', value: 'Technician', icon: '📱' },
  { label: 'Cleaner', value: 'Cleaner', icon: '🧹' },
]

const TIME_SLOTS = [
  '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
  '05:00 PM', '06:00 PM'
]

const SERVICE_ICONS = { electrician: '⚡', plumber: '🔧', 'ac repair': '❄️', carpenter: '🪚', painter: '🎨', technician: '📱', cleaner: '🧹' }

export default function Search() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [workers, setWorkers] = useState([])
  const [loading, setLoading] = useState(false)
  const [area, setArea] = useState(searchParams.get('area') || '')
  const [serviceType, setServiceType] = useState(searchParams.get('service') || 'All Services')
  const [error, setError] = useState('')

  // Booking modal state
  const [bookingWorker, setBookingWorker] = useState(null)
  const [bookingDate, setBookingDate] = useState('')
  const [bookingSlot, setBookingSlot] = useState('')
  const [bookingNote, setBookingNote] = useState('')
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [bookingError, setBookingError] = useState('')
  const [customerLat, setCustomerLat] = useState(null)
  const [customerLng, setCustomerLng] = useState(null)
  const [customerAddress, setCustomerAddress] = useState('')
  const [locLoading, setLocLoading] = useState(false)

  useEffect(() => { performSearch() }, [serviceType])

  const performSearch = async () => {
    setLoading(true); setError('')
    try {
      const params = new URLSearchParams()
      if (serviceType && serviceType !== 'All Services') params.set('service', serviceType.toLowerCase())
      if (area.trim()) params.set('city', area.trim())
      const res = await fetch(`${API_BASE_URL}/api/workers?${params.toString()}`)
      const json = await res.json()
      if (!json.success) throw new Error(json.message || 'Server error')
      setWorkers(json.data || [])
      const urlParams = {}
      if (serviceType && serviceType !== 'All Services') urlParams.service = serviceType.toLowerCase()
      if (area.trim()) urlParams.area = area.trim()
      setSearchParams(urlParams, { replace: true })
    } catch (err) { setError('Failed to search workers. Please try again.') }
    finally { setLoading(false) }
  }

  const handleSearch = (e) => { e.preventDefault(); performSearch() }

  const openBooking = (worker) => {
    if (!user) { alert('Please log in to book a worker.'); return }
    setBookingWorker(worker); setBookingDate(''); setBookingSlot(''); setBookingNote('')
    setBookingSuccess(false); setBookingError(''); setCustomerLat(null); setCustomerLng(null); setCustomerAddress('')
  }

  const reverseGeocode = async (lat, lng) => {
    try { const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`); const data = await res.json(); return data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}` }
    catch { return `${lat.toFixed(5)}, ${lng.toFixed(5)}` }
  }

  const applyLocation = async (lat, lng) => { setCustomerLat(lat); setCustomerLng(lng); const addr = await reverseGeocode(lat, lng); setCustomerAddress(addr); setLocLoading(false); setBookingError('') }

  const shareLocation = () => {
    if (!navigator.geolocation) { setBookingError('Geolocation not supported.'); return }
    setLocLoading(true); setBookingError('')
    navigator.geolocation.getCurrentPosition(
      (pos) => applyLocation(pos.coords.latitude, pos.coords.longitude),
      () => { navigator.geolocation.getCurrentPosition(
        (pos) => applyLocation(pos.coords.latitude, pos.coords.longitude),
        async () => { try { const res = await fetch('https://ipapi.co/json/'); const data = await res.json(); if (data.latitude && data.longitude) await applyLocation(data.latitude, data.longitude); else throw new Error('No coords') } catch { setLocLoading(false); setBookingError('Could not detect location.') } },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
      )}, { enableHighAccuracy: true, timeout: 15000 }
    )
  }

  const handleBooking = async () => {
    if (!bookingDate || !bookingSlot) { setBookingError('Please select a date and time slot.'); return }
    setBookingLoading(true); setBookingError('')
    try {
      const { error: insertErr } = await supabase.from('bookings').insert({
        customer_id: user.id, worker_id: bookingWorker.user_id, service_type: bookingWorker.service_type,
        booking_date: bookingDate, time_slot: bookingSlot, note: bookingNote.trim() || null, status: 'pending',
        customer_lat: customerLat, customer_lng: customerLng, customer_address: customerAddress.trim() || null,
      })
      if (insertErr) throw insertErr
      setBookingSuccess(true)
    } catch (err) { setBookingError(err.message || 'Failed to create booking.') }
    finally { setBookingLoading(false) }
  }

  const getMinDate = () => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0] }
  const getRating = (w) => (4 + Math.random()).toFixed(1)
  const getJobs = (w) => Math.floor(10 + Math.random() * 90)

  return (
    <div className="min-h-screen bg-[#0b1120]">
      {/* Hero search banner */}
      <div className="relative bg-gradient-to-br from-slate-800 via-[#0f1a2e] to-green-900/30 border-b border-white/5">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="max-w-5xl mx-auto px-4 pt-8 pb-10 relative">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={16} className="text-green-400" />
            <span className="text-green-400 text-xs font-semibold uppercase tracking-wider">Trusted Professionals</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">Find & Book Service Experts</h1>
          <p className="text-slate-400 text-sm mb-6 max-w-md">Verified professionals at your doorstep. Book instantly, pay securely.</p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="text" value={area} onChange={(e) => setArea(e.target.value)} placeholder="Enter your city or area..."
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-green-500/50 focus:bg-white/10 transition text-sm" />
            </div>
            <button type="submit" disabled={loading}
              className="px-8 py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm shadow-lg shadow-green-500/20 cursor-pointer">
              <SearchIcon size={16} /> {loading ? 'Searching...' : 'Search'}
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
          {SERVICE_FILTERS.map((s) => (
            <button key={s.value} type="button" onClick={() => setServiceType(s.value)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap cursor-pointer shrink-0 ${
                serviceType === s.value
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/20'
                  : 'bg-slate-800/80 text-slate-400 border border-white/10 hover:text-white hover:border-white/20 hover:bg-slate-700/80'
              }`}>
              <span className="text-sm">{s.icon}</span> {s.label}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6"><p className="text-red-400 text-sm">{error}</p></div>}

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-400 text-sm">Finding the best professionals...</p>
            </div>
          </div>
        ) : workers.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-slate-800/80 rounded-3xl flex items-center justify-center mx-auto mb-5">
              <SearchIcon size={32} className="text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No professionals found</h3>
            <p className="text-slate-400 text-sm max-w-sm mx-auto">
              {area.trim() ? `No workers in "${area}" for "${serviceType}". Try a different area.` : 'Search by area or select a service category above.'}
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-slate-400 text-sm"><span className="text-white font-semibold">{workers.length}</span> professional{workers.length !== 1 ? 's' : ''} available</p>
              <div className="flex items-center gap-1.5 text-xs text-green-400"><Shield size={12} /> <span>Verified Experts</span></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workers.map((worker, idx) => {
                const rating = getRating(worker)
                const jobs = getJobs(worker)
                const sIcon = SERVICE_ICONS[worker.service_type?.toLowerCase()] || '🔧'
                return (
                  <div key={worker.id || idx}
                    className="group bg-slate-800/60 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden hover:border-green-500/20 hover:shadow-lg hover:shadow-green-500/5 transition-all duration-300">
                    {/* Service badge header */}
                    <div className="px-5 pt-4 pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400/20 to-emerald-600/20 border border-green-500/20 flex items-center justify-center text-2xl shrink-0">
                            {sIcon}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-white font-bold text-[15px] truncate group-hover:text-green-400 transition-colors">{worker.full_name}</h3>
                            <p className="text-green-400 text-xs font-medium capitalize mt-0.5">{worker.service_type || 'General'}</p>
                          </div>
                        </div>
                        {/* Rating badge */}
                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-green-500/10 border border-green-500/20 shrink-0">
                          <Star size={11} className="text-green-400 fill-green-400" />
                          <span className="text-green-400 text-xs font-bold">{rating}</span>
                        </div>
                      </div>
                    </div>

                    {/* Info section */}
                    <div className="px-5 pb-3">
                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><MapPin size={11} /> {worker.city || worker.location || 'N/A'}</span>
                        <span className="flex items-center gap-1"><ThumbsUp size={11} /> {jobs} jobs</span>
                      </div>
                      {worker.phone && (
                        <div className="flex items-center gap-1 mt-1.5 text-xs text-slate-500">
                          <Phone size={10} /> {worker.phone}
                        </div>
                      )}
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-white/5 mx-5" />

                    {/* Bottom action */}
                    <div className="px-5 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Shield size={12} className="text-emerald-500" />
                        <span className="text-emerald-500 text-[10px] font-semibold uppercase tracking-wider">Verified</span>
                      </div>
                      <button type="button" onClick={() => openBooking(worker)}
                        className="px-5 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white text-xs font-bold rounded-lg transition-all duration-300 flex items-center gap-1.5 shadow-lg shadow-green-500/20 hover:shadow-green-500/30 cursor-pointer">
                        Book Now <ChevronRight size={13} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* ===== BOOKING MODAL ===== */}
      {bookingWorker && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm" style={{animation:'fadeIn .2s ease'}}>
          <div className="w-full max-w-md bg-[#111827] border border-white/10 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto" style={{animation:'slideUp .3s ease'}}>

            {bookingSuccess ? (
              <div className="px-6 py-12 text-center">
                <div className="w-20 h-20 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center mx-auto mb-5" style={{animation:'bounceIn .5s ease'}}>
                  <CheckCircle size={36} className="text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Booking Confirmed! 🎉</h3>
                <p className="text-slate-400 text-sm mb-1"><span className="text-white font-medium">{bookingWorker.full_name}</span> — {bookingWorker.service_type}</p>
                <p className="text-slate-500 text-sm">📅 {bookingDate} &nbsp;·&nbsp; 🕐 {bookingSlot}</p>
                <p className="text-green-400 text-xs mt-3">The worker will confirm your booking shortly</p>
                <button type="button" onClick={() => setBookingWorker(null)}
                  className="mt-6 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl text-sm transition cursor-pointer shadow-lg shadow-green-500/20">
                  Done
                </button>
              </div>
            ) : (
              <>
                {/* Modal header with worker card */}
                <div className="bg-gradient-to-br from-green-900/40 to-slate-800/80 px-6 pt-5 pb-4 border-b border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-white">Book Service</h2>
                    <button type="button" onClick={() => setBookingWorker(null)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"><X size={18} /></button>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400/20 to-emerald-600/20 border border-green-500/20 flex items-center justify-center text-xl shrink-0">
                      {SERVICE_ICONS[bookingWorker.service_type?.toLowerCase()] || '🔧'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-white text-sm font-bold truncate">{bookingWorker.full_name}</p>
                      <p className="text-green-400 text-xs capitalize">{bookingWorker.service_type}</p>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-green-500/10"><Star size={10} className="text-green-400 fill-green-400" /><span className="text-green-400 text-xs font-bold">{getRating(bookingWorker)}</span></div>
                  </div>
                </div>

                <div className="px-6 py-5 space-y-5">
                  {/* Date */}
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-semibold text-white mb-2"><CalendarDays size={14} className="text-green-400" /> When do you need the service?</label>
                    <input type="date" min={getMinDate()} value={bookingDate} onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-white/10 text-white focus:outline-none focus:border-green-500/50 transition text-sm" />
                  </div>

                  {/* Time */}
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-semibold text-white mb-2"><Clock size={14} className="text-green-400" /> Preferred time slot</label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {TIME_SLOTS.map((slot) => (
                        <button key={slot} type="button" onClick={() => setBookingSlot(slot)}
                          className={`py-2.5 px-1 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
                            bookingSlot === slot
                              ? 'bg-green-500 text-white shadow-lg shadow-green-500/20 scale-[1.02]'
                              : 'bg-slate-800/80 text-slate-400 border border-white/5 hover:text-white hover:border-green-500/20 hover:bg-slate-700/80'
                          }`}>{slot}</button>
                      ))}
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-semibold text-white mb-2"><MapPin size={14} className="text-green-400" /> Service location</label>
                    {customerLat && customerLng ? (
                      <div className="space-y-2">
                        <div className="rounded-xl overflow-hidden border border-white/10 h-32">
                          <iframe title="loc" width="100%" height="100%" style={{ border: 0 }} loading="lazy"
                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${customerLng-0.005},${customerLat-0.003},${customerLng+0.005},${customerLat+0.003}&layer=mapnik&marker=${customerLat},${customerLng}`} />
                        </div>
                        <p className="text-slate-400 text-xs truncate" title={customerAddress}>📍 {customerAddress}</p>
                        <button type="button" onClick={() => { setCustomerLat(null); setCustomerLng(null); setCustomerAddress('') }} className="text-xs text-red-400 hover:text-red-300 cursor-pointer">✕ Remove</button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <button type="button" onClick={shareLocation} disabled={locLoading}
                          className="w-full py-3 bg-blue-500/10 hover:bg-blue-500/15 border border-blue-500/20 text-blue-400 rounded-xl text-xs font-medium transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50">
                          {locLoading ? <><Loader2 size={14} className="animate-spin" /> Detecting...</> : <><Navigation size={14} /> Use Current Location</>}
                        </button>
                        <div className="flex items-center gap-2"><div className="flex-1 h-px bg-white/5" /><span className="text-slate-600 text-[10px]">or type address</span><div className="flex-1 h-px bg-white/5" /></div>
                        <input type="text" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} placeholder="Enter your full address..."
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-green-500/50 transition text-xs" />
                      </div>
                    )}
                  </div>

                  {/* Note */}
                  <div>
                    <label className="text-sm font-semibold text-white mb-1.5 block">Describe your issue (optional)</label>
                    <textarea value={bookingNote} onChange={(e) => setBookingNote(e.target.value)} placeholder="E.g. Leaking pipe in kitchen, need urgent fix..."
                      rows={2} className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-green-500/50 transition text-sm resize-none" />
                  </div>

                  {bookingError && (
                    <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                      <AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5" /><p className="text-red-400 text-xs">{bookingError}</p>
                    </div>
                  )}

                  <button type="button" onClick={handleBooking} disabled={bookingLoading}
                    className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all duration-300 text-sm flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 cursor-pointer">
                    {bookingLoading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Booking...</>
                      : <><CheckCircle size={16} /> Confirm Booking</>}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(40px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes bounceIn { 0% { opacity:0; transform:scale(0.5) } 60% { transform:scale(1.1) } 100% { opacity:1; transform:scale(1) } }
        .scrollbar-hide::-webkit-scrollbar { display: none }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none }
      `}</style>
    </div>
  )
}