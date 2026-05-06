import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Bell, LogOut, Settings, CheckCircle, X,
  Leaf, ChevronDown, User, Menu, BarChart3,
  Home, Activity, Droplets, Sprout, Play, Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAlerts } from '../context/AlertContext';
import { logout } from '../firebase/auth';

const NAV_LINKS = [
  { name: 'Dashboard',  href: '/dashboard',  icon: Home },
  { name: 'Monitoring', href: '/monitoring', icon: Activity },
  { name: 'Watering',   href: '/watering',   icon: Droplets },
  { name: 'Planting',   href: '/planting',   icon: Sprout },
  { name: 'Reports',    href: '/reports',    icon: BarChart3 },
  { name: 'Simulation', href: '/simulation', icon: Play },
  { name: 'Alerts',     href: '/alerts',     icon: Bell },
  { name: 'Settings',   href: '/settings',   icon: Settings },
];

const severityDot = { high: 'bg-red-500', medium: 'bg-amber-400', low: 'bg-primary-500' };

const formatTime = (ts) => {
  const m = Math.floor((Date.now() - new Date(ts).getTime()) / 60000);
  if (m < 1)    return 'Just now';
  if (m < 60)   return `${m}m ago`;
  if (m < 1440) return `${Math.floor(m / 60)}h ago`;
  return new Date(ts).toLocaleDateString();
};

const initials = (name) =>
  name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : 'U';

const Navbar = () => {
  const { userData } = useAuth();
  const { unreadCount, getRecentAlerts, markAsRead, dismissAlert, markAllAsRead } = useAlerts();
  const [showBell,    setShowBell]    = useState(false);
  const [showUser,    setShowUser]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const location = useLocation();
  const navRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setShowBell(false);
        setShowUser(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location]);

  const handleLogout = async () => {
    const r = await logout();
    if (r.success) window.location.reload();
  };

  const navLinks = userData?.role === 'admin'
    ? [...NAV_LINKS, { name: 'Admin', href: '/admin', icon: Users }]
    : NAV_LINKS;

  return (
    <div ref={navRef} className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4">

      {/* ── Floating pill navbar ── */}
      <nav className="w-full max-w-6xl bg-white/90 backdrop-blur-md rounded-2xl
                      border border-blue-100 shadow-pill flex items-center
                      justify-between px-5 py-3 gap-4">

        {/* Logo */}
        <NavLink to="/dashboard" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="h-8 w-8 rounded-xl bg-primary-600 flex items-center
                          justify-center shadow-glow-sm">
            <Leaf className="h-4 w-4 text-white" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-[#1e3a8a] text-base tracking-tight leading-none">
              SAPRO
            </span>
            <span className="text-slate-400 text-xs font-medium hidden sm:inline">
              Greenhouse
            </span>
          </div>
        </NavLink>

        {/* ── Desktop nav links ── */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map(({ name, href, icon: Icon }) => (
            <NavLink
              key={href}
              to={href}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium
                 transition-all duration-200 whitespace-nowrap
                 ${isActive
                   ? 'text-[#1e3a8a] bg-blue-50 font-semibold'
                   : 'text-slate-500 hover:text-[#1e3a8a] hover:bg-blue-50'}`
              }
            >
              <Icon className="h-3.5 w-3.5 flex-shrink-0" />
              {name}
              {name === 'Alerts' && unreadCount > 0 && (
                <span className="ml-0.5 h-4 min-w-4 px-1 bg-red-500 text-white
                                  text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </NavLink>
          ))}
        </div>

        {/* ── Right controls ── */}
        <div className="flex items-center gap-1.5 flex-shrink-0">

          {/* Bell */}
          <div className="relative">
            <button
              onClick={() => { setShowBell(!showBell); setShowUser(false); }}
              className="btn-icon relative"
            >
              <Bell className="h-4.5 w-4.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-0.5 bg-red-500
                                  text-white text-[10px] font-bold rounded-full
                                  flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showBell && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl
                              border border-blue-100 shadow-card-hover
                              animate-slide-up overflow-hidden z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-blue-50">
                  <span className="font-bold text-[#1e3a8a] text-sm">Notifications</span>
                  {unreadCount > 0 && (
                    <button onClick={markAllAsRead}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {getRecentAlerts().length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-sm">
                      <Bell className="h-6 w-6 mx-auto mb-2 opacity-40" />
                      No notifications
                    </div>
                  ) : (
                    getRecentAlerts().map((alert) => (
                      <div key={alert.id}
                        className={`flex items-start gap-3 px-4 py-3 border-b
                                    border-blue-50 last:border-0 hover:bg-blue-50/60
                                    transition-colors ${!alert.read ? 'bg-blue-50/30' : ''}`}>
                        <div className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0
                                         ${severityDot[alert.severity] ?? 'bg-slate-400'}`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${alert.read ? 'text-slate-400' : 'text-slate-800 font-medium'}`}>
                            {alert.message}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {formatTime(alert.timestamp)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {!alert.read && (
                            <button onClick={() => markAsRead(alert.id)}
                              className="p-1 text-slate-300 hover:text-primary-500 transition-colors"
                              title="Mark as read">
                              <CheckCircle className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button onClick={() => dismissAlert(alert.id)}
                            className="p-1 text-slate-300 hover:text-red-500 transition-colors"
                            title="Dismiss">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User avatar */}
          <div className="relative">
            <button
              onClick={() => { setShowUser(!showUser); setShowBell(false); }}
              className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full
                          hover:bg-blue-50 border border-transparent hover:border-blue-100
                          transition-all duration-200"
            >
              <div className="h-7 w-7 rounded-full bg-primary-600 flex items-center
                              justify-center text-white text-xs font-bold flex-shrink-0">
                {initials(userData?.name)}
              </div>
              <span className="hidden sm:block text-xs font-semibold text-slate-700 max-w-[80px] truncate">
                {userData?.name?.split(' ')[0] || 'User'}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {showUser && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl
                              border border-blue-100 shadow-card-hover animate-slide-up z-50">
                <div className="px-4 py-3 border-b border-blue-50">
                  <p className="text-sm font-bold text-slate-800 truncate">{userData?.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5 truncate capitalize">{userData?.role}</p>
                </div>
                <div className="py-1.5">
                  <NavLink to="/settings"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm
                               text-slate-600 hover:bg-blue-50 transition-colors">
                    <Settings className="h-4 w-4 text-slate-400" />
                    Settings
                  </NavLink>
                  <button onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm
                               text-red-500 hover:bg-red-50 transition-colors">
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden btn-icon"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </nav>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div className="absolute top-[calc(100%+8px)] left-4 right-4 bg-white rounded-2xl
                        border border-blue-100 shadow-card-hover animate-slide-up
                        overflow-hidden lg:hidden">
          <div className="p-3 grid grid-cols-2 gap-1">
            {navLinks.map(({ name, href, icon: Icon }) => (
              <NavLink
                key={href}
                to={href}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium
                   transition-colors
                   ${isActive
                     ? 'bg-blue-50 text-[#1e3a8a] font-semibold'
                     : 'text-slate-500 hover:bg-blue-50 hover:text-[#1e3a8a]'}`
                }
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {name}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
