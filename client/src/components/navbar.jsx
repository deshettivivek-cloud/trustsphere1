import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LogOut, User, Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center">
            <span className="text-white text-sm font-bold">T</span>
          </div>
          <span className="font-display font-bold text-slate-900 text-lg">TrustSphere</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link to="/search" className="text-slate-600 hover:text-green-600 text-sm font-medium transition-colors">
            Find Workers
          </Link>
          {user ? (
            <>
              <Link to="/dashboard" className="text-slate-600 hover:text-green-600 text-sm font-medium transition-colors">
                Dashboard
              </Link>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-50 rounded-full px-3 py-1.5">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                    <User size={12} className="text-green-600" />
                  </div>
                  <span className="text-sm text-slate-700 font-medium">{profile?.full_name?.split(' ')[0]}</span>
                </div>
                <button onClick={handleSignOut} className="text-slate-400 hover:text-red-500 transition-colors">
                  <LogOut size={18} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-slate-600 hover:text-green-600 text-sm font-medium">Login</Link>
              <Link to="/register" className="bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                Register
              </Link>
            </div>
          )}
        </div>

        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 py-4 space-y-3">
          <Link to="/search" className="block text-slate-700 text-sm" onClick={() => setMenuOpen(false)}>Find Workers</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="block text-slate-700 text-sm" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <button onClick={handleSignOut} className="block text-red-500 text-sm">Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="block text-slate-700 text-sm" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" className="block text-green-600 text-sm font-semibold" onClick={() => setMenuOpen(false)}>Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}