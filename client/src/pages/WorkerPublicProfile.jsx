import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { Star, MapPin, Clock, Phone, CheckCircle, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(star => (
        <Star
          key={star}
          size={16}
          className={star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200 fill-slate-200'}
        />
      ))}
    </div>
  )
}

export default function WorkerPublicProfile() {
  const { id } = useParams()
  const { user, profile } = useAuth()
  const [worker, setWorker] = useState(null)
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState({ description: '', address: '', scheduled_at: '' })
  const [bookingLoading, setBookingLoading] = useState(false)
  const [showBookingForm, setShowBookingForm] = useState(false)

  useEffect(() => {
    const fetchWorker = async () => {
      try {
        const res = await api.get(`/workers/${id}`)
        setWorker(res.data.data)
      } catch (err) {
        toast.error('Worker not found')
      } finally {
        setLoading(false)
      }
    }
    fetchWorker()
  }, [id])

  const handleBooking = async (e) => {
    e.preventDefault()
    if (!user) {
      toast.error('Please login to book a worker')
      return
    }
    if (profile?.role !== 'customer') {
      toast.error('Only customers can book workers')
      return
    }

    setBookingLoading(true)
    try {
      await api.post('/bookings', {
        worker_id: id,
        service_type: worker.service_type,
        description: booking.description,
        address: booking.address,
        scheduled_at: booking.scheduled_at,
      })
      toast.success('Booking request sent! ✅')
      setShowBookingForm(false)
      setBooking({ description: '', address: '', scheduled_at: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed')
    } finally {
      setBookingLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!worker) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500">Worker not found</p>
          <Link to="/search" className="text-green-600 text-sm mt-2 inline-block">← Back to Search</Link>
        </div>
      </div>
    )
  }

  const workerProfile = worker.profiles

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Back button */}
        <Link to="/search" className="flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm mb-4">
          <ArrowLeft size={16} /> Back to Search
        </Link>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center shrink-0">
              <span className="text-green-700 font-bold text-2xl">
                {workerProfile?.full_name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-xl font-display font-bold text-slate-900">{workerProfile?.full_name}</h1>
                  <span className="inline-block bg-green-50 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full mt-1">
                    {worker.service_type}
                  </span>
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                  worker.is_available
                    ? 'bg-green-50 text-green-600'
                    : 'bg-slate-100 text-slate-500'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${worker.is_available ? 'bg-green-500' : 'bg-slate-400'}`} />
                  {worker.is_available ? 'Available' : 'Unavailable'}
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mt-2">
                <StarRating rating={Math.round(worker.avg_rating)} />
                <span className="text-sm font-semibold text-slate-700">
                  {worker.avg_rating ? Number(worker.avg_rating).toFixed(1) : 'No ratings yet'}
                </span>
                {worker.total_reviews > 0 && (
                  <span className="text-xs text-slate-400">({worker.total_reviews} reviews)</span>
                )}
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-3 mt-5">
            {worker.location && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <MapPin size={15} className="text-slate-400" /> {worker.location}
              </div>
            )}
            {worker.experience_years > 0 && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Clock size={15} className="text-slate-400" /> {worker.experience_years} years experience
              </div>
            )}
            {workerProfile?.phone && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Phone size={15} className="text-slate-400" /> +91 {workerProfile.phone}
              </div>
            )}
            {worker.hourly_rate > 0 && (
              <div className="text-sm font-semibold text-green-600">
                ₹{worker.hourly_rate} / hour
              </div>
            )}
          </div>

          {/* Bio */}
          {worker.bio && (
            <div className="mt-4 p-4 bg-slate-50 rounded-xl">
              <p className="text-slate-600 text-sm leading-relaxed">{worker.bio}</p>
            </div>
          )}

          {/* Skills */}
          {worker.skills?.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {worker.skills.map(skill => (
                  <span key={skill} className="flex items-center gap-1 text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-100">
                    <CheckCircle size={11} /> {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Book Button */}
        {worker.is_available && profile?.role === 'customer' && (
          <div className="mb-4">
            {!showBookingForm ? (
              <button
                onClick={() => setShowBookingForm(true)}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 rounded-2xl transition-colors"
              >
                Book {workerProfile?.full_name?.split(' ')[0]}
              </button>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h3 className="font-display font-bold text-slate-900 mb-4">Send Booking Request</h3>
                <form onSubmit={handleBooking} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">What do you need?</label>
                    <textarea
                      value={booking.description}
                      onChange={e => setBooking({...booking, description: e.target.value})}
                      rows={3}
                      required
                      placeholder="Describe the work you need done..."
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-green-400 text-sm outline-none resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Your Address</label>
                    <input
                      value={booking.address}
                      onChange={e => setBooking({...booking, address: e.target.value})}
                      required
                      placeholder="Full address where work needs to be done"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-green-400 text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Preferred Date & Time</label>
                    <input
                      type="datetime-local"
                      value={booking.scheduled_at}
                      onChange={e => setBooking({...booking, scheduled_at: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-green-400 text-sm outline-none"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setShowBookingForm(false)}
                      className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50">
                      Cancel
                    </button>
                    <button type="submit" disabled={bookingLoading}
                      className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-semibold py-3 rounded-xl text-sm transition-colors">
                      {bookingLoading ? 'Sending...' : 'Send Request'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Reviews */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-display font-bold text-slate-900 mb-4">
            Reviews {worker.reviews?.length > 0 && `(${worker.reviews.length})`}
          </h3>
          {worker.reviews?.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-6">No reviews yet. Be the first to review!</p>
          ) : (
            <div className="space-y-4">
              {worker.reviews?.map(review => (
                <div key={review.id} className="border-b border-slate-50 pb-4 last:border-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-slate-800">{review.profiles?.full_name}</span>
                    <StarRating rating={review.rating} />
                  </div>
                  {review.comment && <p className="text-slate-500 text-sm">{review.comment}</p>}
                  <p className="text-xs text-slate-400 mt-1">{new Date(review.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}