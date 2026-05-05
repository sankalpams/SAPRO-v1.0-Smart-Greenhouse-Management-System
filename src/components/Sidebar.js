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
  Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAlerts } from '../context/AlertContext';

const Sidebar = () => {
  const { userData } = useAuth();
  const { unreadCount } = useAlerts();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Monitoring', href: '/monitoring', icon: Activity },
    { name: 'Watering', href: '/watering', icon: Droplets },
    { name: 'Planting', href: '/planting', icon: Sprout },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
    { name: 'Simulation', href: '/simulation', icon: Play },
    { name: 'Settings', href: '/settings', icon: Settings },
    { name: 'Alerts', href: '/alerts', icon: Bell, badge: unreadCount },
  ];

  // Add admin route if user is admin
  if (userData?.role === 'admin') {
    navigation.push({ name: 'Admin', href: '/admin', icon: Users });
  }

  return (
    <div className="fixed left-0 top-16 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-40">
      <nav className="p-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    `sidebar-item ${isActive ? 'active' : ''}`
                  }
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                  {item.badge && item.badge > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>

        {/* Quick Stats */}
        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Quick Stats
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Active Plants</span>
              <span className="font-medium text-gray-900 dark:text-white">24</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Next Watering</span>
              <span className="font-medium text-gray-900 dark:text-white">2h 15m</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Alerts Today</span>
              <span className="font-medium text-red-600">3</span>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="flex items-center">
            <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm font-medium text-green-800 dark:text-green-300">
              System Online
            </span>
          </div>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
            All sensors operational
          </p>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
