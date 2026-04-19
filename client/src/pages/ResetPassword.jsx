// src/pages/ResetPassword.jsx

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [sessionReady, setSessionReady] = useState(false)

  // Supabase automatically picks up the recovery token from the URL hash
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true)
      }
    })

    // Also check if already in a session (user clicked the link and got auto-signed in)
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) setSessionReady(true)
    })

    return () => subscription.unsubscribe()
  }, [])

  const validate = () => {
    if (!password) return 'Please enter a new password'
    if (password.length < 6) return 'Password must be at least 6 characters'
    if (password !== confirmPassword) return 'Passwords do not match'
    return ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError('')

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      })

      if (updateError) throw updateError

      setSuccess(true)
      toast.success('Password updated successfully! 🎉')

      // Redirect to dashboard after 2 seconds
      setTimeout(() => navigate('/dashboard'), 2000)
    } catch (err) {
      console.error('Reset password error:', err)
      setError(err.message || 'Failed to update password')
      toast.error(err.message || 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  // Password strength indicator
  const getStrength = () => {
    if (!password) return { label: '', color: '', width: '0%' }
    if (password.length < 6) return { label: 'Too short', color: 'bg-red-500', width: '20%' }
    if (password.length < 8) return { label: 'Weak', color: 'bg-orange-500', width: '40%' }
    if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) return { label: 'Strong', color: 'bg-green-500', width: '100%' }
    if (/(?=.*\d)/.test(password)) return { label: 'Medium', color: 'bg-yellow-500', width: '60%' }
    return { label: 'Weak', color: 'bg-orange-500', width: '40%' }
  }

  const strength = getStrength()

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-gray-900 rounded-2xl shadow-xl p-8">

        {success ? (
          /* Success state */
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={32} className="text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Password Updated!</h1>
            <p className="text-gray-400 text-sm mb-4">
              Your password has been successfully changed.
            </p>
            <p className="text-gray-500 text-xs">Redirecting to dashboard...</p>
          </div>
        ) : !sessionReady ? (
          /* Waiting for session / invalid link */
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mx-auto mb-5">
              <AlertCircle size={32} className="text-yellow-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Verifying Link...</h1>
            <p className="text-gray-400 text-sm mb-4">
              Please wait while we verify your reset link.
            </p>
            <p className="text-gray-500 text-xs">
              If this takes too long, the link may have expired.{' '}
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-blue-400 hover:text-blue-300 cursor-pointer"
              >
                Request a new one
              </button>
            </p>
          </div>
        ) : (
          /* Reset form */
          <>
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-4">
                <Lock size={24} className="text-blue-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-1">Set New Password</h1>
              <p className="text-gray-400 text-sm">
                Choose a strong password for your account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError('') }}
                    placeholder="At least 6 characters"
                    className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition text-sm pr-10"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Strength meter */}
                {password && (
                  <div className="mt-2">
                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                        style={{ width: strength.width }}
                      />
                    </div>
                    <p className={`text-xs mt-1 ${
                      strength.label === 'Strong' ? 'text-green-400' :
                      strength.label === 'Medium' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {strength.label}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Confirm Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError('') }}
                  placeholder="Re-enter your password"
                  className={`w-full px-4 py-3 rounded-xl bg-gray-800 border ${
                    confirmPassword && confirmPassword !== password ? 'border-red-500' : 'border-gray-700'
                  } text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition text-sm`}
                />
                {confirmPassword && confirmPassword !== password && (
                  <p className="text-red-400 text-xs mt-1">Passwords don't match</p>
                )}
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Lock size={16} />
                    Update Password
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
