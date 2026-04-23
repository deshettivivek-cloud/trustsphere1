// src/pages/Cart.jsx — Premium Gradient Theme

import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import Breadcrumb from '../components/Breadcrumb'
import {
  ShoppingCart, Plus, Minus, Trash2, ChevronRight,
  ArrowLeft, Sparkles, Shield, Clock, BadgePercent
} from 'lucide-react'

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal } = useCart()

  // Group items by category
  const grouped = cartItems.reduce((acc, item) => {
    const key = item.categoryId || 'other'
    if (!acc[key]) acc[key] = { name: item.categoryName, icon: item.categoryIcon, items: [] }
    acc[key].items.push(item)
    return acc
  }, {})

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #eef2ff 0%, #f0ecff 50%, #f5f0ff 100%)' }}>
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Breadcrumb items={[{ label: 'Cart' }]} />
          <div className="text-center py-20 animate-fade-in">
            <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 border border-gray-100 shadow-lg shadow-blue-100/30">
              <ShoppingCart size={40} className="text-gray-300" />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-3">Your cart is empty</h1>
            <p className="text-gray-500 text-sm mb-8 max-w-sm mx-auto">
              Browse our services and add items to get started with your booking.
            </p>
            <Link
              to="/services"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 text-sm hover:scale-[1.02] active:scale-95"
            >
              <Sparkles size={16} />
              Browse Services
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #eef2ff 0%, #f0ecff 50%, #f5f0ff 100%)' }}>
      {/* Breadcrumb Bar */}
      <div className="bg-white/70 backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <Breadcrumb items={[{ label: 'Services', to: '/services' }, { label: 'Cart' }]} />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 animate-fade-in">
          <div className="flex items-center gap-3">
            <Link to="/services" className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-200 transition shadow-sm hover:shadow-md">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-xl font-extrabold text-gray-900">Your Cart</h1>
              <p className="text-gray-500 text-xs mt-0.5">{cartCount} item{cartCount !== 1 ? 's' : ''} selected</p>
            </div>
          </div>
          <button
            onClick={clearCart}
            className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 cursor-pointer transition px-3 py-2 rounded-lg hover:bg-red-50 border border-transparent hover:border-red-200 font-medium"
          >
            <Trash2 size={13} />
            Clear All
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Cart Items */}
          <div className="flex-1 space-y-4">
            {Object.entries(grouped).map(([catId, group]) => (
              <div key={catId} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm animate-fade-in hover:shadow-lg hover:shadow-blue-100/30 transition-shadow">
                <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2" style={{ background: 'linear-gradient(90deg, #f8faff, #f3f0ff)' }}>
                  <span className="text-lg">{group.icon}</span>
                  <h3 className="text-gray-800 font-bold text-sm">{group.name}</h3>
                  <span className="text-gray-400 text-xs ml-auto">{group.items.length} service{group.items.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="divide-y divide-gray-50">
                  {group.items.map((item) => (
                    <div key={item.id} className="px-5 py-4 flex items-center gap-4 hover:bg-blue-50/20 transition">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center shrink-0 shadow-sm">
                        <span className="text-2xl">{item.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-gray-900 text-sm font-semibold truncate">{item.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-blue-600 text-sm font-bold">₹{item.price}</span>
                          <span className="text-gray-300 text-xs flex items-center gap-1">
                            <Clock size={10} /> {item.duration}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => item.quantity === 1 ? removeFromCart(item.id) : updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-red-50 border border-gray-200 hover:border-red-200 text-gray-400 hover:text-red-500 flex items-center justify-center cursor-pointer transition"
                        >
                          {item.quantity === 1 ? <Trash2 size={12} /> : <Minus size={12} />}
                        </button>
                        <span className="w-7 text-center text-gray-900 font-bold text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-600 flex items-center justify-center cursor-pointer transition"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <div className="text-right w-20 shrink-0">
                        <p className="text-gray-900 font-bold text-sm">₹{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <Link
              to="/services"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-semibold transition mt-2"
            >
              <Plus size={14} />
              Add more services
            </Link>
          </div>

          {/* Order Summary */}
          <div className="lg:w-80 shrink-0">
            <div className="bg-white border border-gray-100 rounded-2xl p-5 sticky top-20 shadow-sm animate-slide-right">
              <h3 className="text-gray-900 font-extrabold text-sm mb-4">Order Summary</h3>

              <div className="space-y-3 mb-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 truncate mr-2">{item.name} × {item.quantity}</span>
                    <span className="text-gray-700 font-medium shrink-0">₹{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-3 mb-4 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-gray-800 font-medium">₹{cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Platform fee</span>
                  <span className="text-emerald-600 font-semibold">FREE</span>
                </div>
              </div>

              {/* Coupon hint */}
              <div className="mb-4 p-3 rounded-xl border border-dashed border-orange-200 bg-orange-50/50">
                <div className="flex items-center gap-2 text-xs text-orange-600 font-medium">
                  <BadgePercent size={13} />
                  Use code <span className="font-mono font-bold bg-orange-100 px-1.5 py-0.5 rounded">INLOC15</span> for 15% off
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3 mb-5">
                <div className="flex items-center justify-between">
                  <span className="text-gray-800 font-bold text-sm">Total</span>
                  <span className="text-blue-600 font-extrabold text-xl">₹{cartTotal.toLocaleString()}</span>
                </div>
              </div>

              <Link
                to="/search"
                className="block w-full text-center py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 text-sm hover:scale-[1.01] active:scale-[0.99]"
              >
                Proceed to Book →
              </Link>

              <div className="flex items-center justify-center gap-2 text-gray-400 text-[10px] mt-3">
                <Shield size={11} />
                <span>100% Secure & Verified Professionals</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
