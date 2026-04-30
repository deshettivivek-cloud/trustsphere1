// src/pages/Search.jsx

import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { API_BASE_URL } from '../lib/capacitor'
import {
  Search as SearchIcon, MapPin, Phone, Briefcase,
  X, Clock, CalendarDays, CheckCircle, AlertCircle,
  Navigation, Loader2
} from 'lucide-react'

const SERVICE_FILTERS = [
  'All Services', 'Electrician', 'Plumber', 'AC Repair',
  'Carpenter', 'Painter', 'Technician', 'Cleaner'
]

const TIME_SLOTS = [
  '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
  '05:00 PM', '06:00 PM'
]

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

  // Location state
  const [customerLat, setCustomerLat] = useState(null)
  const [customerLng, setCustomerLng] = useState(null)
  const [customerAddress, setCustomerAddress] = useState('')
  const [locLoading, setLocLoading] = useState(false)

  // Search on mount and when filters change
  useEffect(() => {
    performSearch()
  }, [serviceType])

  const performSearch = async () => {
    setLoading(true)
    setError('')

    try {
      // Build query params for server API
      const params = new URLSearchParams()
      if (serviceType && serviceType !== 'All Services') {
        params.set('service', serviceType.toLowerCase())
      }
      if (area.trim()) {
        params.set('city', area.trim())
      }

      // Call server API (uses service role key — bypasses RLS, returns names)
      const res = await fetch(`${API_BASE_URL}/api/workers?${params.toString()}`)
      const json = await res.json()

      if (!json.success) throw new Error(json.message || 'Server error')

      setWorkers(json.data || [])

      // Update URL params
      const urlParams = {}
      if (serviceType && serviceType !== 'All Services') urlParams.service = serviceType.toLowerCase()
      if (area.trim()) urlParams.area = area.trim()
      setSearchParams(urlParams, { replace: true })

    } catch (err) {
      console.error('Search error:', err)
      setError('Failed to search workers. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    performSearch()
  }

  // Open booking modal
  const openBooking = (worker) => {
    if (!user) {
      alert('Please log in to book a worker.')
      return
    }
    setBookingWorker(worker)
    setBookingDate('')
    setBookingSlot('')
    setBookingNote('')
    setBookingSuccess(false)
    setBookingError('')
    setCustomerLat(null)
    setCustomerLng(null)
    setCustomerAddress('')
  }

  // Reverse geocode helper
  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
      const data = await res.json()
      return data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`
    } catch {
      return `${lat.toFixed(5)}, ${lng.toFixed(5)}`
    }
  }

  // Set location from coords
  const applyLocation = async (lat, lng) => {
    setCustomerLat(lat)
    setCustomerLng(lng)
    const addr = await reverseGeocode(lat, lng)
    setCustomerAddress(addr)
    setLocLoading(false)
    setBookingError('')
  }

  // Get customer's current GPS location
  const shareLocation = () => {
    if (!navigator.geolocation) {
      setBookingError('Geolocation is not supported by your browser.')
      return
    }
    setLocLoading(true)
    setBookingError('')

    // Try high accuracy first (GPS hardware)
    navigator.geolocation.getCurrentPosition(
      (pos) => applyLocation(pos.coords.latitude, pos.coords.longitude),
      () => {
        // Retry with low accuracy (WiFi/network-based — works on desktops)
        navigator.geolocation.getCurrentPosition(
          (pos) => applyLocation(pos.coords.latitude, pos.coords.longitude),
          async () => {
            // Final fallback: IP-based geolocation
            try {
              const res = await fetch('https://ipapi.co/json/')
              const data = await res.json()
              if (data.latitude && data.longitude) {
                await applyLocation(data.latitude, data.longitude)
              } else {
                throw new Error('No coordinates')
              }
            } catch {
              setLocLoading(false)
              setBookingError('Could not detect location. Please enter your address manually.')
            }
          },
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
        )
      },
      { enableHighAccuracy: true, timeout: 15000 }
    )
  }

  // Submit booking
  const handleBooking = async () => {
    if (!bookingDate || !bookingSlot) {
      setBookingError('Please select a date and time slot.')
      return
    }

    setBookingLoading(true)
    setBookingError('')

    try {
      const { error: insertErr } = await supabase
        .from('bookings')
        .insert({
          customer_id: user.id,
          worker_id: bookingWorker.user_id,
          service_type: bookingWorker.service_type,
          booking_date: bookingDate,
          time_slot: bookingSlot,
          note: bookingNote.trim() || null,
          status: 'pending',
          customer_lat: customerLat,
          customer_lng: customerLng,
          customer_address: customerAddress.trim() || null,
        })

      if (insertErr) throw insertErr

      setBookingSuccess(true)
    } catch (err) {
      console.error('Booking error:', err)
      setBookingError(err.message || 'Failed to create booking. The bookings table may not exist yet.')
    } finally {
      setBookingLoading(false)
    }
  }

  // Get tomorrow's date as min date
  const getMinDate = () => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d.toISOString().split('T')[0]
  }

  return (
    <div className="min-h-screen bg-[#0b1120]">
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Find Service Workers</h1>
          <p className="text-slate-400 text-sm">Search trusted professionals in your area</p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="Enter city or area..."
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-green-500/50 transition text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-green-500 hover:bg-green-400 disabled:bg-green-500/50 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 text-sm cursor-pointer"
          >
            <SearchIcon size={16} />
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {/* Service Type Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {SERVICE_FILTERS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setServiceType(s)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition cursor-pointer ${
                serviceType === s
                  ? 'bg-green-500 text-white'
                  : 'bg-slate-800 text-slate-400 border border-white/10 hover:text-white hover:border-white/20'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-400 text-sm">Searching workers...</p>
            </div>
          </div>
        ) : workers.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <SearchIcon size={24} className="text-slate-500" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No workers found</h3>
            <p className="text-slate-400 text-sm">
              {area.trim()
                ? `No workers found in "${area}" for "${serviceType}". Try a different area or service.`
                : 'Try searching by area or selecting a service type above.'}
            </p>
          </div>
        ) : (
          <>
            <p className="text-slate-500 text-xs mb-4">{workers.length} worker{workers.length !== 1 ? 's' : ''} found</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {workers.map((worker, idx) => (
                <div
                  key={worker.id || idx}
                  className="bg-slate-800/60 border border-white/5 rounded-2xl p-5 hover:border-green-500/20 transition-all"
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                      {worker.full_name?.charAt(0)?.toUpperCase() || '?'}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-white font-semibold truncate">{worker.full_name}</h3>

                      <div className="flex items-center gap-1.5 mt-1">
                        <Briefcase size={12} className="text-green-400" />
                        <span className="text-green-400 text-xs font-medium capitalize">{worker.service_type || 'General'}</span>
                      </div>

                      <div className="flex items-center gap-1.5 mt-1">
                        <MapPin size={12} className="text-slate-500" />
                        <span className="text-slate-400 text-xs">{worker.city || worker.location || 'Not specified'}</span>
                      </div>

                      {worker.phone && (
                        <div className="flex items-center gap-1.5 mt-1">
                          <Phone size={12} className="text-slate-500" />
                          <span className="text-slate-400 text-xs">{worker.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Book Now button */}
                  <button
                    type="button"
                    onClick={() => openBooking(worker)}
                    className="mt-4 w-full py-2.5 bg-green-500 hover:bg-green-400 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <CalendarDays size={15} />
                    Book Now
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ===== BOOKING MODAL ===== */}
      {bookingWorker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#161b22] border border-white/10 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/5">
              <div>
                <h2 className="text-lg font-bold text-white">Book a Service</h2>
                <p className="text-slate-400 text-xs mt-0.5">Schedule with {bookingWorker.full_name}</p>
              </div>
              <button
                type="button"
                onClick={() => setBookingWorker(null)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {bookingSuccess ? (
              /* Success state */
              <div className="px-6 py-10 text-center">
                <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={28} className="text-green-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Booking Confirmed!</h3>
                <p className="text-slate-400 text-sm mb-1">
                  <span className="text-white font-medium">{bookingWorker.full_name}</span> — {bookingWorker.service_type}
                </p>
                <p className="text-slate-400 text-sm">
                  📅 {bookingDate} &nbsp;·&nbsp; 🕐 {bookingSlot}
                </p>
                <button
                  type="button"
                  onClick={() => setBookingWorker(null)}
                  className="mt-6 px-6 py-2.5 bg-green-500 hover:bg-green-400 text-white font-semibold rounded-xl text-sm transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              /* Booking form */
              <div className="px-6 py-5 space-y-5">

                {/* Worker info mini-card */}
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {bookingWorker.full_name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{bookingWorker.full_name}</p>
                    <p className="text-green-400 text-xs capitalize">{bookingWorker.service_type}</p>
                  </div>
                </div>

                {/* Date picker */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    <CalendarDays size={13} className="inline mr-1.5 -mt-0.5" />
                    Select Date
                  </label>
                  <input
                    type="date"
                    min={getMinDate()}
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-white/10 text-white focus:outline-none focus:border-green-500/50 transition text-sm"
                  />
                </div>

                {/* Time slots */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <Clock size={13} className="inline mr-1.5 -mt-0.5" />
                    Select Time Slot
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {TIME_SLOTS.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setBookingSlot(slot)}
                        className={`py-2 px-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                          bookingSlot === slot
                            ? 'bg-green-500 text-white'
                            : 'bg-slate-800 text-slate-400 border border-white/10 hover:text-white hover:border-white/20'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    <MapPin size={13} className="inline mr-1.5 -mt-0.5" />
                    Your Location
                  </label>

                  {customerLat && customerLng ? (
                    <div className="space-y-2">
                      {/* Mini map */}
                      <div className="rounded-xl overflow-hidden border border-white/10 h-36">
                        <iframe
                          title="Your location"
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          loading="lazy"
                          src={`https://www.openstreetmap.org/export/embed.html?bbox=${customerLng - 0.005},${customerLat - 0.003},${customerLng + 0.005},${customerLat + 0.003}&layer=mapnik&marker=${customerLat},${customerLng}`}
                        />
                      </div>
                      <p className="text-slate-400 text-xs truncate" title={customerAddress}>
                        📍 {customerAddress}
                      </p>
                      <button
                        type="button"
                        onClick={() => { setCustomerLat(null); setCustomerLng(null); setCustomerAddress('') }}
                        className="text-xs text-red-400 hover:text-red-300 cursor-pointer"
                      >
                        ✕ Remove location
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={shareLocation}
                        disabled={locLoading}
                        className="w-full py-2.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 rounded-xl text-xs font-medium transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {locLoading ? (
                          <><Loader2 size={14} className="animate-spin" /> Getting location...</>
                        ) : (
                          <><Navigation size={14} /> Share My Location (GPS)</>
                        )}
                      </button>
                      <div className="text-center text-slate-600 text-[10px]">or enter manually</div>
                      <input
                        type="text"
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        placeholder="Enter your address..."
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition text-xs"
                      />
                    </div>
                  )}
                </div>

                {/* Note */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Note (optional)
                  </label>
                  <textarea
                    value={bookingNote}
                    onChange={(e) => setBookingNote(e.target.value)}
                    placeholder="Describe what you need..."
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-green-500/50 transition text-sm resize-none"
                  />
                </div>

                {/* Error */}
                {bookingError && (
                  <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                    <AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
                    <p className="text-red-400 text-xs">{bookingError}</p>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="button"
                  onClick={handleBooking}
                  disabled={bookingLoading}
                  className="w-full py-3 bg-green-500 hover:bg-green-400 disabled:bg-green-500/50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  {bookingLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Booking...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} />
                      Confirm Booking
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}