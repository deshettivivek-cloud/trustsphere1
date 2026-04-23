import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Shield, Star, Zap, ChevronRight, Sparkles, ArrowRight, MapPin } from 'lucide-react'
import { getAllCategories, SERVICE_CATEGORIES } from '../data/serviceData'

const STEPS = [
  { step: '01', title: 'Choose a Service', desc: 'Browse categories and pick the services you need.', icon: '🔍' },
  { step: '02', title: 'Add to Cart', desc: 'Select multiple services and build your booking.', icon: '🛒' },
  { step: '03', title: 'Book a Professional', desc: 'Find verified workers near you and schedule instantly.', icon: '📅' },
  { step: '04', title: 'Rate & Review', desc: 'After the job, leave a review to help the community.', icon: '⭐' },
]

const POPULAR_SERVICES = [
  { icon: '🔌', name: 'Switchboard Repair', price: 199, tag: 'Most Booked', slug: 'electrician' },
  { icon: '🚰', name: 'Tap Installation', price: 249, tag: null, slug: 'plumber' },
  { icon: '🧊', name: 'AC Service', price: 499, tag: 'Popular', slug: 'ac-repair' },
  { icon: '🚪', name: 'Door Repair', price: 299, tag: null, slug: 'carpenter' },
  { icon: '🏠', name: '1 Room Painting', price: 2499, tag: 'Premium', slug: 'painter' },
  { icon: '📺', name: 'TV Mounting', price: 499, tag: null, slug: 'technician' },
]

export default function Home() {
  const allCategories = getAllCategories()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showResults, setShowResults] = useState(false)

  // Search handler — filters categories and services
  const handleSearch = (query) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setSearchResults([])
      setShowResults(false)
      return
    }

    const q = query.toLowerCase()
    const results = []

    // Search through all categories and their services
    Object.entries(SERVICE_CATEGORIES).forEach(([slug, cat]) => {
      // Check if category name matches
      if (cat.name.toLowerCase().includes(q)) {
        results.push({ type: 'category', name: cat.name, icon: cat.icon, slug, desc: cat.description })
      }
      // Check individual services
      cat.services.forEach(svc => {
        if (svc.name.toLowerCase().includes(q) || svc.description.toLowerCase().includes(q)) {
          results.push({ type: 'service', name: svc.name, icon: svc.icon, slug, categoryName: cat.name, price: svc.price })
        }
      })
    })

    setSearchResults(results.slice(0, 8))
    setShowResults(true)
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    // Find best matching category
    const q = searchQuery.toLowerCase()
    const match = Object.entries(SERVICE_CATEGORIES).find(([slug, cat]) =>
      cat.name.toLowerCase().includes(q) || slug.includes(q)
    )
    if (match) {
      navigate(`/services/${match[0]}`)
    } else {
      navigate('/services')
    }
    setShowResults(false)
  }

  return (
    <div className="min-h-screen bg-white">

      {/* ===== HERO — Soft Pastel Gradient ===== */}
      <section className="relative overflow-hidden" style={{
        background: 'linear-gradient(135deg, #f0f4ff 0%, #e8eeff 25%, #f5f0ff 50%, #fef5f0 75%, #fff8f0 100%)'
      }}>
        {/* Subtle decorative elements */}
        <div className="absolute top-10 right-10 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-10 w-60 h-60 bg-violet-200/15 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-4 py-16 md:py-24">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-full px-5 py-2 text-sm text-gray-600 mb-6 shadow-sm">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Trusted by 10,000+ customers across India
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-5">
              Find Trusted
              <span className="block text-blue-600">Home Services</span>
              <span className="block text-gray-900">Near You</span>
            </h1>
            <p className="text-gray-500 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
              Connect with verified professionals for all your home needs.
              Quality service. Fair prices. Every time.
            </p>
          </div>

          {/* Working Search Bar */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto relative">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <div className="flex items-center gap-3 bg-white rounded-2xl px-5 py-4 shadow-lg shadow-gray-200/50 border border-gray-100">
                  <Search size={20} className="text-gray-400 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    onFocus={() => searchQuery && setShowResults(true)}
                    placeholder="Try 'plumber', 'AC repair', 'electrician'..."
                    className="flex-1 outline-none text-gray-800 text-sm bg-transparent placeholder-gray-400 font-medium"
                  />
                  {searchQuery && (
                    <button type="button" onClick={() => { setSearchQuery(''); setShowResults(false) }}
                      className="text-gray-400 hover:text-gray-600 cursor-pointer text-xs font-medium">
                      Clear
                    </button>
                  )}
                </div>

                {/* Live Search Dropdown */}
                {showResults && searchResults.length > 0 && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowResults(false)} />
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl shadow-gray-200/60 border border-gray-100 z-20 py-2 max-h-80 overflow-y-auto">
                      {searchResults.map((result, i) => (
                        <Link
                          key={i}
                          to={`/services/${result.slug}`}
                          onClick={() => setShowResults(false)}
                          className="flex items-center gap-3 px-5 py-3 hover:bg-blue-50/50 transition-colors"
                        >
                          <span className="text-xl w-8 text-center">{result.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{result.name}</p>
                            <p className="text-xs text-gray-400">
                              {result.type === 'category' ? result.desc : `in ${result.categoryName} · ₹${result.price}`}
                            </p>
                          </div>
                          <ChevronRight size={14} className="text-gray-300" />
                        </Link>
                      ))}
                    </div>
                  </>
                )}
                {showResults && searchQuery && searchResults.length === 0 && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowResults(false)} />
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-20 p-6 text-center">
                      <p className="text-gray-500 text-sm">No services found for "{searchQuery}"</p>
                      <Link to="/services" className="text-blue-600 text-sm font-medium mt-1 inline-block" onClick={() => setShowResults(false)}>
                        Browse all services →
                      </Link>
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center gap-3 bg-white rounded-2xl px-5 py-4 shadow-lg shadow-gray-200/50 border border-gray-100">
                <MapPin size={16} className="text-blue-500" />
                <input type="text" placeholder="Your city" className="w-28 outline-none text-gray-700 text-sm bg-transparent placeholder-gray-400 font-medium" />
              </div>

              <button type="submit" className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 transition-all rounded-2xl px-8 py-4 font-bold text-sm text-white shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 hover:scale-[1.02] active:scale-95 cursor-pointer">
                Search <ChevronRight size={16} />
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* ===== Service Categories — FIXED ROUTING ===== */}
      <section className="bg-white py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">Browse by Service</h2>
              <p className="text-gray-500 text-sm">Pick what you need — verified professionals ready to help.</p>
            </div>
            <Link to="/services" className="hidden sm:flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-semibold transition">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {allCategories.map((cat, i) => (
              <Link
                key={cat.id}
                to={`/services/${cat.id}`}
                className="group flex flex-col items-center gap-3 p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-100/60 transition-all duration-300 cursor-pointer hover:-translate-y-1.5 hover:border-blue-200"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center group-hover:scale-110 group-hover:from-blue-100 group-hover:to-indigo-100 transition-all duration-300 shadow-sm">
                  <span className="text-2xl">{cat.icon}</span>
                </div>
                <div className="text-center">
                  <span className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{cat.name}</span>
                  <span className="block text-[10px] text-gray-400 mt-0.5">{cat.services.length} services</span>
                </div>
              </Link>
            ))}
          </div>

          <div className="sm:hidden mt-5 text-center">
            <Link to="/services" className="inline-flex items-center gap-1 text-blue-600 text-sm font-semibold">
              View All Services <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== Popular Services — FIXED ROUTING ===== */}
      <section className="bg-gray-50/50 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={18} className="text-orange-500" />
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">Popular Services</h2>
          </div>
          <p className="text-gray-500 text-sm mb-8">Most booked services this month</p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {POPULAR_SERVICES.map((svc, i) => (
              <Link
                key={svc.name}
                to={`/services/${svc.slug}`}
                className="group relative flex flex-col items-center p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-100/40 transition-all duration-300 text-center hover:-translate-y-1.5 hover:border-blue-200"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {svc.tag && (
                  <span className="absolute -top-2 right-2 bg-orange-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                    {svc.tag}
                  </span>
                )}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-sm">
                  <span className="text-2xl">{svc.icon}</span>
                </div>
                <span className="text-xs font-semibold text-gray-800 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">{svc.name}</span>
                <span className="text-blue-600 text-xs font-bold">₹{svc.price}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== How It Works ===== */}
      <section className="bg-white py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2 text-center">How InLocFix Works</h2>
          <p className="text-gray-500 mb-12 text-center text-sm">Simple. Safe. Fast.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {STEPS.map(({ step, title, desc, icon }, i) => (
              <div key={step} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:shadow-blue-50 transition-all duration-300 hover:-translate-y-1 group"
                style={{ animationDelay: `${i * 100}ms` }}>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4 shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                  <span className="text-xl">{icon}</span>
                </div>
                <div className="text-3xl font-black text-blue-600 mb-2">{step}</div>
                <h3 className="font-bold text-gray-900 mb-2 text-sm">{title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Trust ===== */}
      <section className="bg-gray-50/50 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: <Shield size={22} className="text-blue-600" />, bg: 'from-blue-50 to-blue-100', title: 'Verified Workers', desc: 'Background checked & certified professionals.' },
              { icon: <Star size={22} className="text-amber-500" />, bg: 'from-amber-50 to-amber-100', title: 'Real Reviews', desc: 'Only customers who booked can leave reviews.' },
              { icon: <Zap size={22} className="text-violet-500" />, bg: 'from-violet-50 to-violet-100', title: 'Fast Booking', desc: 'Book in under 2 minutes. Workers respond quickly.' },
            ].map(({ icon, bg, title, desc }) => (
              <div key={title} className="flex items-start gap-4 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${bg} flex items-center justify-center shrink-0 shadow-sm`}>{icon}</div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1 text-sm">{title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="relative overflow-hidden py-20" style={{
        background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)'
      }}>
        <div className="absolute top-[-60px] right-[-40px] w-60 h-60 bg-white/10 rounded-full blur-3xl" />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Are you a Service Worker?</h2>
          <p className="text-white/80 mb-8 text-lg">Create your free profile and start getting jobs from customers near you.</p>
          <Link to="/register" className="inline-flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-50 transition-all font-bold px-8 py-4 rounded-2xl shadow-xl shadow-blue-900/20 hover:scale-[1.02] active:scale-95">
            Register as a Worker <ChevronRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  )
}