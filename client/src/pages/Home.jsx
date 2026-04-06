import { Link } from 'react-router-dom'
import { Search, Shield, Star, Zap, ChevronRight } from 'lucide-react'

const SERVICE_ICONS = [
  { icon: '⚡', label: 'Electrician', color: 'bg-yellow-50 text-yellow-600 border-yellow-200' },
  { icon: '🔧', label: 'Plumber', color: 'bg-blue-50 text-blue-600 border-blue-200' },
  { icon: '❄️', label: 'AC Repair', color: 'bg-cyan-50 text-cyan-600 border-cyan-200' },
  { icon: '🪚', label: 'Carpenter', color: 'bg-orange-50 text-orange-600 border-orange-200' },
  { icon: '🎨', label: 'Painter', color: 'bg-purple-50 text-purple-600 border-purple-200' },
  { icon: '📱', label: 'Technician', color: 'bg-green-50 text-green-600 border-green-200' },
]

const STEPS = [
  { step: '01', title: 'Search a Service', desc: 'Find skilled workers by service type and your location instantly.' },
  { step: '02', title: 'View Profiles', desc: 'Check ratings, reviews, experience, and verified badges.' },
  { step: '03', title: 'Book & Connect', desc: 'Send a booking request directly to the worker.' },
  { step: '04', title: 'Rate & Review', desc: 'After the job, leave a review to help build the community.' },
]

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-green-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}
        />
        <div className="relative max-w-5xl mx-auto px-4 py-20 md:py-32">
          <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500/30 rounded-full px-4 py-1.5 text-sm text-green-300 mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Trusted by 10,000+ customers across India
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold leading-tight mb-6">
            Find Trusted Local
            <span className="block text-green-400">Service Workers</span>
            <span className="block">Near You</span>
          </h1>
          <p className="text-slate-300 text-lg md:text-xl mb-10 max-w-2xl">
            Connect with verified electricians, plumbers, technicians and more.
            Real ratings. Real reviews. Real trust.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl">
            <div className="flex-1 flex items-center gap-3 bg-white rounded-xl px-4 py-3">
              <Search size={20} className="text-slate-400 shrink-0" />
              <input type="text" placeholder="What service do you need?" className="flex-1 outline-none text-slate-800 text-sm bg-transparent" />
            </div>
            <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl px-4 py-3">
              <span className="text-slate-300 text-sm">📍</span>
              <input type="text" placeholder="Your city" className="w-32 outline-none text-white text-sm bg-transparent placeholder-slate-400" />
            </div>
            <Link to="/search" className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 transition-colors rounded-xl px-6 py-3 font-semibold text-sm">
              Search <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-slate-900 mb-2">Browse by Service</h2>
        <p className="text-slate-500 mb-8">Pick what you need and find the right professional.</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {SERVICE_ICONS.map(({ icon, label, color }) => (
            <Link key={label} to={`/search?service=${label.toLowerCase()}`}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 ${color} hover:scale-105 transition-transform cursor-pointer`}>
              <span className="text-3xl">{icon}</span>
              <span className="text-xs font-semibold text-center">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-slate-900 mb-2 text-center">How TrustSphere Works</h2>
          <p className="text-slate-500 mb-12 text-center">Simple. Safe. Fast.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map(({ step, title, desc }) => (
              <div key={step} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <div className="text-4xl font-display font-black text-green-500 mb-3">{step}</div>
                <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust indicators */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: <Shield size={24} className="text-green-600" />, bg: 'bg-green-50', title: 'Verified Workers', desc: 'Phone and email verified before they can take jobs.' },
            { icon: <Star size={24} className="text-yellow-500" />, bg: 'bg-yellow-50', title: 'Real Reviews', desc: 'Only customers who booked can leave reviews.' },
            { icon: <Zap size={24} className="text-blue-500" />, bg: 'bg-blue-50', title: 'Fast Booking', desc: 'Book in under 2 minutes. Workers respond quickly.' },
          ].map(({ icon, bg, title, desc }) => (
            <div key={title} className="flex items-start gap-4 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center shrink-0`}>{icon}</div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
                <p className="text-slate-500 text-sm">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Are you a Service Worker?</h2>
          <p className="text-green-100 mb-8 text-lg">Create your free profile and start getting jobs from customers near you.</p>
          <Link to="/register" className="inline-flex items-center gap-2 bg-white text-green-700 hover:bg-green-50 transition-colors font-semibold px-8 py-4 rounded-xl">
            Register as a Worker <ChevronRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  )
}