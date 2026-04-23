// src/components/Breadcrumb.jsx

import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

export default function Breadcrumb({ items = [] }) {
  const location = useLocation()
  // Detect if we're on a light-themed page
  const isLight = location.pathname === '/services' || location.pathname === '/cart'

  return (
    <nav className="flex items-center gap-1.5 text-sm flex-wrap" aria-label="Breadcrumb">
      <Link
        to="/"
        className={`flex items-center gap-1 transition-colors duration-200 ${
          isLight
            ? 'text-gray-400 hover:text-blue-600'
            : 'text-slate-400 hover:text-green-400'
        }`}
      >
        <Home size={14} />
        <span>Home</span>
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1
        return (
          <span key={item.label} className="flex items-center gap-1.5">
            <ChevronRight size={12} className={isLight ? 'text-gray-300' : 'text-slate-600'} />
            {isLast ? (
              <span className={`font-medium ${isLight ? 'text-gray-800' : 'text-white'}`}>{item.label}</span>
            ) : (
              <Link
                to={item.to}
                className={`transition-colors duration-200 ${
                  isLight
                    ? 'text-gray-400 hover:text-blue-600'
                    : 'text-slate-400 hover:text-green-400'
                }`}
              >
                {item.label}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
