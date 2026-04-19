import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { useState, useEffect, useRef } from "react";
import {
  Home,
  Search,
  LayoutDashboard,
  LogIn,
  UserPlus,
  LogOut,
  Menu,
  X,
  ChevronDown,
  User,
  Shield,
} from "lucide-react";

const Navbar = () => {
  const { user, profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const profileRef = useRef(null);

  // Track scroll for navbar background
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
    setShowTooltip(false);
  }, [location.pathname]);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // --- SIGN OUT: timeout-protected, never hangs ---
  const handleSignOut = async () => {
    setProfileOpen(false);
    try {
      await Promise.race([
        supabase.auth.signOut(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000)),
      ]);
    } catch (err) {
      console.error("Sign out (forcing clear):", err);
      // Force-clear auth tokens so user is truly logged out
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("sb-")) localStorage.removeItem(key);
      });
    } finally {
      navigate("/login");
      window.location.reload();
    }
  };

  const isActive = (path) => location.pathname === path;

  const NAV_LINKS = [
    { to: "/", label: "Home", icon: Home },
    { to: "/search", label: "Search", icon: Search },
    ...(user
      ? [{ to: "/dashboard", label: "Dashboard", icon: LayoutDashboard }]
      : []),
  ];

  const displayName = profile?.full_name || user?.email || "Account";
  const userInitial = displayName.charAt(0).toUpperCase();
  const userEmail = user?.email || "";
  const isWorker = profile?.role === "service_worker";
  const roleBadgeText = isWorker ? "Service Worker" : "Customer";
  const roleBadgeClass = isWorker
    ? "bg-green-500/20 text-green-400"
    : "bg-blue-500/20 text-blue-400";

  return (
    <>
      <nav
        id="main-navbar"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#0d1117]/95 backdrop-blur-xl shadow-lg shadow-black/20 border-b border-white/5"
            : "bg-[#0d1117]/80 backdrop-blur-md border-b border-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              to="/"
              id="navbar-logo"
              className="flex items-center gap-2.5 group"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20 group-hover:shadow-green-500/40 transition-shadow duration-300">
                <Shield size={16} className="text-white" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                TrustSphere
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  id={`nav-link-${label.toLowerCase()}`}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(to)
                      ? "text-green-400 bg-green-500/10"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon size={16} />
                  {label}
                  {isActive(to) && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-green-400 rounded-full" />
                  )}
                </Link>
              ))}
            </div>

            {/* Right Side — Auth */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                /* Logged-in: Account button with hover tooltip + click dropdown */
                <div
                  className="relative"
                  ref={profileRef}
                  onMouseEnter={() => { if (!profileOpen) setShowTooltip(true); }}
                  onMouseLeave={() => setShowTooltip(false)}
                >
                  <button
                    id="navbar-profile-btn"
                    onClick={() => {
                      setShowTooltip(false);
                      setProfileOpen(!profileOpen);
                    }}
                    className={`flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-full border transition-all duration-200 cursor-pointer ${
                      profileOpen
                        ? "bg-white/10 border-green-500/40"
                        : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10"
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-xs font-bold text-white shadow-inner">
                      {userInitial}
                    </div>
                    <span className="text-sm font-medium text-slate-200 max-w-[120px] truncate">
                      {profile?.full_name || "Account"}
                    </span>
                    <ChevronDown
                      size={14}
                      className={`text-slate-400 transition-transform duration-200 ${
                        profileOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Hover Tooltip Card */}
                  {showTooltip && !profileOpen && (
                    <div className="absolute right-0 mt-2 min-w-[220px] bg-gray-800 border border-white/10 rounded-xl shadow-lg shadow-black/40 p-4 animate-in fade-in duration-200 pointer-events-none z-50">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
                          {userInitial}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white truncate">
                            {displayName}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {userEmail}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`inline-block text-[10px] px-2.5 py-1 rounded-full font-medium ${roleBadgeClass}`}
                      >
                        {isWorker ? "🔧" : "👤"} {roleBadgeText}
                      </span>
                    </div>
                  )}

                  {/* Click Dropdown Menu */}
                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-[#161b22] border border-white/10 rounded-xl shadow-2xl shadow-black/40 py-1.5 z-50">
                      {/* User info header */}
                      <div className="px-4 py-3 border-b border-white/5">
                        <p className="text-sm font-semibold text-white truncate">
                          {displayName}
                        </p>
                        <p className="text-xs text-slate-400 truncate mt-0.5">
                          {userEmail}
                        </p>
                        {profile?.role && (
                          <span
                            className={`inline-block text-[10px] px-2 py-0.5 rounded-full mt-1.5 font-medium ${roleBadgeClass}`}
                          >
                            {isWorker ? "🔧 Worker" : "👤 Customer"}
                          </span>
                        )}
                      </div>

                      <Link
                        to="/dashboard"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <LayoutDashboard size={15} />
                        Dashboard
                      </Link>

                      <div className="border-t border-white/5 mt-1 pt-1">
                        <button
                          id="navbar-logout-btn"
                          onClick={(e) => { e.stopPropagation(); handleSignOut(); }}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
                        >
                          <LogOut size={15} />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Guest auth buttons */
                <>
                  <Link
                    to="/login"
                    id="navbar-login-btn"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition-all duration-200"
                  >
                    <LogIn size={15} />
                    Login
                  </Link>
                  <Link
                    to="/register"
                    id="navbar-register-btn"
                    className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg hover:from-green-400 hover:to-emerald-500 shadow-lg shadow-green-500/20 hover:shadow-green-500/40 transition-all duration-300"
                  >
                    <UserPlus size={15} />
                    Register
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Hamburger */}
            <button
              id="navbar-mobile-toggle"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden transition-all duration-300 overflow-hidden ${
            mobileOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-4 pb-4 pt-2 border-t border-white/5 space-y-1 bg-[#0d1117]/95 backdrop-blur-xl">
            {NAV_LINKS.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive(to)
                    ? "text-green-400 bg-green-500/10"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            ))}

            <div className="border-t border-white/5 pt-3 mt-2">
              {user ? (
                <>
                  {/* Mobile user info */}
                  <div className="flex items-center gap-3 px-4 py-3 mb-2">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-sm font-bold text-white">
                      {userInitial}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {displayName}
                      </p>
                      <p className="text-xs text-slate-400">
                        {roleBadgeText}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    <LogOut size={18} />
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex gap-3">
                  <Link
                    to="/login"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-slate-300 border border-white/10 rounded-xl hover:bg-white/5 transition-colors"
                  >
                    <LogIn size={16} />
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg shadow-green-500/20 transition-colors"
                  >
                    <UserPlus size={16} />
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer to prevent content from hiding behind the fixed navbar */}
      <div className="h-16" />
    </>
  );
};

export default Navbar;