import React from 'react';
import { AlertTriangle, X, CheckCircle, Clock, Droplets, Thermometer, Cloud } from 'lucide-react';
import { getAlertIcon, getAlertSeverityColor } from '../utils/alertLogic';

const AlertsPanel = ({ alerts, onMarkAsRead, onDismiss }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'High Temperature':
        return <Thermometer className="h-4 w-4" />;
      case 'Low Moisture':
        return <Droplets className="h-4 w-4" />;
      case 'High Humidity':
        return <Cloud className="h-4 w-4" />;
      case 'Watering Due':
        return <Clock className="h-4 w-4" />;
      case 'Planting Due':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800';
      case 'low':
        return 'border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800';
      default:
        return 'border-gray-200 bg-gray-50 dark:bg-gray-900/20 dark:border-gray-800';
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  if (!alerts || alerts.length === 0) {
    return (
      <div className="card p-6">
        <div className="text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Alerts
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            All systems are operating normally
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Active Alerts ({alerts.filter(alert => !alert.read).length})
        </h3>
        <button
          onClick={() => alerts.forEach(alert => onMarkAsRead(alert.id))}
          className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
        >
          Mark all as read
        </button>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)} ${
              alert.read ? 'opacity-60' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${
                  alert.severity === 'high' ? 'bg-red-100 dark:bg-red-900/30' :
                  alert.severity === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                  'bg-blue-100 dark:bg-blue-900/30'
                }`}>
                  {getIcon(alert.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {alert.type}
                    </h4>
                    {!alert.read && (
                      <span className="h-2 w-2 bg-red-500 rounded-full"></span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {alert.message}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {formatTime(alert.timestamp)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {!alert.read && (
                  <button
                    onClick={() => onMarkAsRead(alert.id)}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    title="Mark as read"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => onDismiss(alert.id)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  title="Dismiss"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertsPanel;
