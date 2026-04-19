import { Link } from "react-router-dom";
import { Shield, Globe, MessageCircle, Mail } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="main-footer" className="bg-slate-900 border-t border-white/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Main Footer */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20">
                <Shield size={16} className="text-white" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                TrustSphere
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Connecting you with verified, trusted local service professionals.
              Real ratings. Real reviews. Real trust.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-200"
                aria-label="Social"
              >
                <MessageCircle size={15} />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-200"
                aria-label="Website"
              >
                <Globe size={15} />
              </a>
              <a
                href="mailto:support@trustsphere.com"
                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-200"
                aria-label="Email"
              >
                <Mail size={15} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {[
                { to: "/", label: "Home" },
                { to: "/search", label: "Find Workers" },
                { to: "/dashboard", label: "Dashboard" },
                { to: "/register", label: "Join as Worker" },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm text-slate-400 hover:text-green-400 transition-colors duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
              Support
            </h4>
            <ul className="space-y-2.5">
              {[
                { to: "#", label: "Help Center" },
                { to: "#", label: "Safety Tips" },
                { to: "#", label: "Terms of Service" },
                { to: "#", label: "Privacy Policy" },
              ].map(({ to, label }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-sm text-slate-400 hover:text-green-400 transition-colors duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            © {currentYear} TrustSphere. All rights reserved.
          </p>
          <p className="text-xs text-slate-500">
            Made with 💚 in India
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
