// Dashboard.jsx — smart router: redirects to role-specific dashboard
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, profile, loading: authLoading } = useAuth()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (authLoading) return

    const redirect = async () => {
      try {
        // If we have profile info from context, use it
        if (profile?.role) {
          if (profile.role === 'service_worker') {
            navigate('/dashboard/worker', { replace: true })
          } else {
            navigate('/dashboard/customer', { replace: true })
          }
          return
        }

        // If user exists but no profile in context, fetch it directly
        if (user) {
          const { data: p } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle()

          if (p?.role === 'service_worker') {
            navigate('/dashboard/worker', { replace: true })
          } else {
            navigate('/dashboard/customer', { replace: true })
          }
          return
        }

        // No user at all
        navigate('/get-started', { replace: true })
      } catch (err) {
        console.error('[Dashboard redirect]', err)
        navigate('/dashboard/customer', { replace: true })
      } finally {
        setChecking(false)
      }
    }

    redirect()
  }, [user, profile, authLoading, navigate])

  return (
    <div className="min-h-screen bg-[#0b1120] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Redirecting...</p>
      </div>
    </div>
  )
}