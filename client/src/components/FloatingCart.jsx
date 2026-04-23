// src/components/FloatingCart.jsx

import { Link, useLocation } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '../context/CartContext'

export default function FloatingCart() {
  const { cartCount, cartTotal } = useCart()
  const location = useLocation()

  // Don't show on cart page or services page (which has its own cart panel)
  if (
    cartCount === 0 ||
    location.pathname === '/cart' ||
    location.pathname === '/services' ||
    location.pathname.startsWith('/services/')
  ) {
    return null
  }

  return (
    <Link
      to="/cart"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-3 bg-green-500 hover:bg-green-400 text-white px-5 py-3.5 rounded-2xl shadow-2xl shadow-green-500/30 hover:shadow-green-500/50 transition-all duration-300 group animate-float"
    >
      <div className="relative">
        <ShoppingCart size={20} className="group-hover:scale-110 transition-transform" />
        <span className="absolute -top-2.5 -right-2.5 w-5 h-5 bg-red-500 text-[10px] font-bold rounded-full flex items-center justify-center animate-badge-pop">
          {cartCount}
        </span>
      </div>
      <div className="text-sm">
        <div className="font-semibold">{cartCount} item{cartCount !== 1 ? 's' : ''}</div>
        <div className="text-green-100 text-xs">₹{cartTotal.toLocaleString()}</div>
      </div>
    </Link>
  )
}
