import React, { createContext, useContext, useState, useEffect } from 'react';
import { generateAlerts } from '../utils/dataGenerator';

const AlertContext = createContext();

export const useAlerts = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlerts must be used within an AlertProvider');
  }
  return context;
};

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Load initial alerts
    const initialAlerts = generateAlerts();
    setAlerts(initialAlerts);
    setUnreadCount(initialAlerts.filter(alert => !alert.read).length);
  }, []);

  const addAlert = (alert) => {
    const newAlert = {
      id: Date.now() + Math.random(),
      ...alert,
      timestamp: new Date().toISOString(),
      read: false
    };
    setAlerts(prev => [newAlert, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  const markAsRead = (alertId) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, read: true }
          : alert
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setAlerts(prev => 
      prev.map(alert => ({ ...alert, read: true }))
    );
    setUnreadCount(0);
  };

  const dismissAlert = (alertId) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    setUnreadCount(prev => {
      const alert = alerts.find(a => a.id === alertId);
      return alert && !alert.read ? Math.max(0, prev - 1) : prev;
    });
  };

  const getUnreadAlerts = () => {
    return alerts.filter(alert => !alert.read);
  };

  const getRecentAlerts = (limit = 5) => {
    return alerts.slice(0, limit);
  };

  const value = {
    alerts,
    unreadCount,
    addAlert,
    markAsRead,
    markAllAsRead,
    dismissAlert,
    getUnreadAlerts,
    getRecentAlerts
  };

  return (
    <AlertContext.Provider value={value}>
      {children}
    </AlertContext.Provider>
  );
};
