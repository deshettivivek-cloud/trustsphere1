// src/pages/ForgotPassword.jsx

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) {
      setError('Please enter your email address')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (resetError) throw resetError

      setSent(true)
      toast.success('Reset link sent! Check your email.')
    } catch (err) {
      console.error('Reset password error:', err)
      let msg = err.message || 'Failed to send reset email'
      if (msg === 'Failed to fetch' || msg.includes('fetch')) {
        msg = 'Network error — please check your internet connection.'
      }
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-gray-900 rounded-2xl shadow-xl p-8">

        {/* Back to login */}
        <Link to="/login" className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white text-sm mb-6 transition">
          <ArrowLeft size={14} /> Back to Sign In
        </Link>

        {sent ? (
          /* Success state */
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={32} className="text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Check Your Email</h1>
            <p className="text-gray-400 text-sm mb-2">
              We've sent a password reset link to:
            </p>
            <p className="text-white font-medium text-sm mb-6">{email}</p>
            <p className="text-gray-500 text-xs mb-6">
              Click the link in the email to reset your password. If you don't see it, check your spam folder.
            </p>

            <button
              type="button"
              onClick={() => { setSent(false); setEmail('') }}
              className="text-blue-400 hover:text-blue-300 text-sm font-medium transition cursor-pointer"
            >
              Didn't receive it? Try again
            </button>
          </div>
        ) : (
          /* Form state */
          <>
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-4">
                <Mail size={24} className="text-blue-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-1">Forgot Password?</h1>
              <p className="text-gray-400 text-sm">
                Enter your email and we'll send you a reset link
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError('') }}
                  placeholder="you@example.com"
                  className={`w-full px-4 py-3 rounded-xl bg-gray-800 border ${
                    error ? 'border-red-500' : 'border-gray-700'
                  } text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition text-sm`}
                  autoFocus
                />
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
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail size={16} />
                    Send Reset Link
                  </>
                )}
              </button>
            </form>
          </>
        )}

        <p className="text-center text-gray-400 text-sm mt-6">
          Remember your password?{' '}
          <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">
            Sign In
          </Link>
        </p>

      </div>
    </div>
  )
}
