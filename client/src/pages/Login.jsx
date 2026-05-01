// Login.jsx — backward-compatible redirect to role selection
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { user, profile, loading } = useAuth()

  useEffect(() => {
    if (loading) return

    // If already logged in, redirect to role-appropriate dashboard
    if (user && profile) {
      if (profile.role === 'service_worker') {
        navigate('/dashboard/worker', { replace: true })
      } else {
        navigate('/dashboard/customer', { replace: true })
      }
      return
    }

    // Not logged in → go to role selection
    navigate('/get-started', { replace: true })
  }, [user, profile, loading, navigate])

  return (
    <div className="min-h-screen bg-[#0b1120] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}