// src/pages/ServiceCategory.jsx

import { useParams, Link } from 'react-router-dom'
import { getCategoryBySlug, getAllCategories } from '../data/serviceData'
import { useCart } from '../context/CartContext'
import Breadcrumb from '../components/Breadcrumb'
import {
  ArrowLeft, ShoppingCart, Clock, Plus, Minus, ChevronRight, Star
} from 'lucide-react'

export default function ServiceCategory() {
  const { category: slug } = useParams()
  const categoryData = getCategoryBySlug(slug)
  const { addToCart, removeFromCart, updateQuantity, getItemQuantity, cartCount } = useCart()

  // Category not found
  if (!categoryData) {
    const allCategories = getAllCategories()
    return (
      <div className="min-h-screen bg-[#0b1120]">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <span className="text-4xl">🔍</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-3">Service Not Found</h1>
            <p className="text-slate-400 mb-8">The service category you're looking for doesn't exist.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-lg mx-auto">
              {allCategories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/services/${cat.id}`}
                  className="flex items-center gap-2 px-4 py-3 bg-slate-800/60 border border-white/5 rounded-xl hover:border-green-500/20 transition-all text-sm"
                >
                  <span className="text-lg">{cat.icon}</span>
                  <span className="text-slate-300 font-medium">{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0b1120]">
      {/* Hero Header */}
      <section
        className={`relative bg-gradient-to-br ${categoryData.color} overflow-hidden`}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="relative max-w-5xl mx-auto px-4 py-12 md:py-16">
          {/* Back + Cart */}
          <div className="flex items-center justify-between mb-8">
            <Link
              to="/services"
              className="flex items-center gap-2 text-white/80 hover:text-white transition text-sm font-medium"
            >
              <ArrowLeft size={16} />
              Back to Services
            </Link>
            <Link
              to="/cart"
              className="relative flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2.5 text-white text-sm font-medium transition"
            >
              <ShoppingCart size={16} />
              Cart
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl">{categoryData.icon}</span>
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                  {categoryData.name}
                </h1>
              </div>
              <p className="text-white/80 text-lg max-w-xl">
                {categoryData.description}
              </p>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-1 text-white/70 text-sm">
                  <Star size={14} className="text-yellow-400 fill-yellow-400" />
                  <span>4.8 avg rating</span>
                </div>
                <div className="text-white/40 text-sm">•</div>
                <div className="text-white/70 text-sm">
                  {categoryData.services.length} services available
                </div>
              </div>
            </div>
            <div className="w-36 h-36 md:w-44 md:h-44 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl shadow-black/30 shrink-0 bg-black/20">
              <img
                src={categoryData.heroImage}
                alt={categoryData.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">
            Choose a Service
          </h2>
          <p className="text-slate-500 text-sm">
            {categoryData.services.length} options
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categoryData.services.map((service) => {
            const qty = getItemQuantity(service.id)
            return (
              <div
                key={service.id}
                className="group bg-slate-800/60 border border-white/5 rounded-2xl overflow-hidden hover:border-green-500/20 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/5"
              >
                <div className="flex">
                  {/* Image */}
                  <div className="w-28 md:w-36 shrink-0 relative overflow-hidden">
                    <img
                      src={service.image}
                      alt={service.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0b1120]/20" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-4 flex flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-base">{service.icon}</span>
                          <h3 className="text-white font-semibold text-sm truncate">
                            {service.name}
                          </h3>
                        </div>
                        <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">
                          {service.description}
                        </p>
                      </div>
                    </div>

                    <div className="mt-auto pt-3 flex items-end justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-green-400 font-bold text-lg">
                            ₹{service.price}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-500 text-[11px] mt-0.5">
                          <Clock size={10} />
                          {service.duration}
                        </div>
                      </div>

                      {/* Add to Cart / Quantity Controls */}
                      {qty === 0 ? (
                        <button
                          type="button"
                          onClick={() => addToCart(service, categoryData)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-green-500 hover:bg-green-400 text-white text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer hover:shadow-lg hover:shadow-green-500/20 active:scale-95"
                        >
                          <Plus size={14} />
                          Add
                        </button>
                      ) : (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              qty === 1
                                ? removeFromCart(service.id)
                                : updateQuantity(service.id, qty - 1)
                            }
                            className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 flex items-center justify-center transition cursor-pointer active:scale-90"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center text-white font-bold text-sm">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => addToCart(service, categoryData)}
                            className="w-8 h-8 rounded-lg bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 flex items-center justify-center transition cursor-pointer active:scale-90"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Floating Cart Bar (shows when items in cart) */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#161b22]/95 backdrop-blur-xl border-t border-white/10 shadow-2xl shadow-black/50">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-white font-semibold text-sm">
                {cartCount} item{cartCount !== 1 ? 's' : ''} in cart
              </p>
              <p className="text-slate-400 text-xs">
                Browse more or proceed to checkout
              </p>
            </div>
            <Link
              to="/cart"
              className="flex items-center gap-2 px-6 py-2.5 bg-green-500 hover:bg-green-400 text-white font-semibold text-sm rounded-xl transition-all hover:shadow-lg hover:shadow-green-500/20"
            >
              <ShoppingCart size={16} />
              View Cart
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
