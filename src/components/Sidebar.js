import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Activity,
  Droplets,
  Sprout,
  BarChart3,
  Play,
  Settings,
  Users,
  Bell,
  Wifi
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAlerts } from '../context/AlertContext';

const NAV_ITEMS = [
  { name: 'Dashboard',  href: '/dashboard',  icon: Home },
  { name: 'Monitoring', href: '/monitoring', icon: Activity },
  { name: 'Watering',   href: '/watering',   icon: Droplets },
  { name: 'Planting',   href: '/planting',   icon: Sprout },
  { name: 'Reports',    href: '/reports',    icon: BarChart3 },
  { name: 'Simulation', href: '/simulation', icon: Play },
  { name: 'Settings',   href: '/settings',   icon: Settings },
  { name: 'Alerts',     href: '/alerts',     icon: Bell },
];

const Sidebar = () => {
  const { userData } = useAuth();
  const { unreadCount } = useAlerts();

  const navigation = [...NAV_ITEMS];
  if (userData?.role === 'admin') {
    navigation.push({ name: 'Admin', href: '/admin', icon: Users });
  }

  return (
    <aside className="fixed left-0 top-[3.75rem] h-[calc(100vh-3.75rem)] w-64
                      bg-surface-950/80 backdrop-blur-xl
                      border-r border-white/8 z-40 flex flex-col">
      {/* ── Nav links ── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="px-3 mb-2 text-[10px] font-semibold tracking-widest text-slate-600 uppercase">
          Navigation
        </p>
        <ul className="space-y-0.5">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isBell = item.name === 'Alerts';
            return (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    `sidebar-item ${isActive ? 'active' : ''}`
                  }
                >
                  <Icon className="h-4.5 w-4.5 flex-shrink-0" />
                  <span className="flex-1">{item.name}</span>
                  {isBell && unreadCount > 0 && (
                    <span className="ml-auto h-5 min-w-5 px-1 bg-danger-500 text-white
                                     text-[10px] font-bold rounded-full
                                     flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>

        {/* ── Quick Stats ── */}
        <div className="mt-6">
          <p className="px-3 mb-2 text-[10px] font-semibold tracking-widest text-slate-600 uppercase">
            Quick Stats
          </p>
          <div className="mx-1 rounded-xl border border-white/8 bg-white/3 p-3 space-y-2.5">
            {[
              { label: 'Active Plants', value: '24', color: 'text-primary-400' },
              { label: 'Next Watering', value: '2h 15m', color: 'text-accent-400' },
              { label: 'Alerts Today',  value: '3',     color: 'text-danger-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-xs text-slate-500">{label}</span>
                <span className={`text-xs font-bold ${color}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </nav>

      {/* ── System status footer ── */}
      <div className="px-4 py-4 border-t border-white/8">
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-primary-500/10
                        border border-primary-500/20">
          <div className="relative flex-shrink-0">
            <Wifi className="h-4 w-4 text-primary-400" />
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full
                              bg-primary-500 animate-pulse-slow" />
          </div>
          <div>
            <p className="text-xs font-semibold text-primary-300">System Online</p>
            <p className="text-[10px] text-primary-500/80">All sensors operational</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
