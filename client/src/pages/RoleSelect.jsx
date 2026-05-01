import { Link } from 'react-router-dom'
import { Search, Briefcase, Wrench, CalendarCheck, Star, Users, ArrowRight } from 'lucide-react'
import logo from '../assets/logo.jpg'

export default function RoleSelect() {
  return (
    <div className="min-h-screen bg-[#0b1120] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-green-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/3 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6 group">
            <img src={logo} alt="InLocFix" className="h-12 w-auto object-contain rounded-lg" />
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            How would you like to <span className="text-gradient">get started</span>?
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-md mx-auto">
            Choose your role to access a personalized experience
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">

          {/* Customer Card */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-slate-800/60 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-blue-500/30 transition-all duration-300 h-full flex flex-col">
              {/* Icon */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow duration-300">
                <span className="text-3xl">👤</span>
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">I'm a Customer</h2>
              <p className="text-slate-400 text-sm mb-6 flex-1">
                Find trusted local service workers for plumbing, electrical, AC repair, and more. Book and manage appointments easily.
              </p>

              {/* Features */}
              <div className="space-y-2.5 mb-8">
                {[
                  { icon: Search, text: 'Search nearby workers' },
                  { icon: CalendarCheck, text: 'Book appointments' },
                  { icon: Star, text: 'Rate & review services' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3 text-sm">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                      <Icon size={14} className="text-blue-400" />
                    </div>
                    <span className="text-slate-300">{text}</span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Link
                  to="/register/customer"
                  id="role-register-customer"
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40"
                >
                  Sign Up as Customer <ArrowRight size={16} />
                </Link>
                <Link
                  to="/login/customer"
                  id="role-login-customer"
                  className="w-full py-3 bg-white/5 hover:bg-blue-500/10 border border-white/10 hover:border-blue-500/30 text-slate-300 hover:text-blue-400 font-medium rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm"
                >
                  Already have an account? Sign In
                </Link>
              </div>
            </div>
          </div>

          {/* Worker Card */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-slate-800/60 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-green-500/30 transition-all duration-300 h-full flex flex-col">
              {/* Icon */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-6 shadow-lg shadow-green-500/20 group-hover:shadow-green-500/40 transition-shadow duration-300">
                <span className="text-3xl">🔧</span>
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">I'm a Worker</h2>
              <p className="text-slate-400 text-sm mb-6 flex-1">
                Grow your service business by connecting with local customers. Manage jobs, build your reputation, and get verified.
              </p>

              {/* Features */}
              <div className="space-y-2.5 mb-8">
                {[
                  { icon: Users, text: 'Connect with customers' },
                  { icon: Briefcase, text: 'Manage job requests' },
                  { icon: Wrench, text: 'Showcase your skills' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3 text-sm">
                    <div className="w-7 h-7 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                      <Icon size={14} className="text-green-400" />
                    </div>
                    <span className="text-slate-300">{text}</span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Link
                  to="/register/worker"
                  id="role-register-worker"
                  className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 hover:shadow-green-500/40"
                >
                  Sign Up as Worker <ArrowRight size={16} />
                </Link>
                <Link
                  to="/login/worker"
                  id="role-login-worker"
                  className="w-full py-3 bg-white/5 hover:bg-green-500/10 border border-white/10 hover:border-green-500/30 text-slate-300 hover:text-green-400 font-medium rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm"
                >
                  Already have an account? Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-xs mt-8">
          You can always change your role later from your profile settings.
        </p>
      </div>

      <style>{`
        @keyframes float-left { 0%, 100% { transform: translateY(0) translateX(0); } 50% { transform: translateY(-10px) translateX(5px); } }
        @keyframes float-right { 0%, 100% { transform: translateY(0) translateX(0); } 50% { transform: translateY(-10px) translateX(-5px); } }
      `}</style>
    </div>
  )
}
