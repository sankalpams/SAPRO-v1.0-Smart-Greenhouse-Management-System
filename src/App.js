import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/firebaseConfig';
import { getUserData } from './firebase/auth';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Monitoring from './pages/Monitoring';
import Watering from './pages/Watering';
import Planting from './pages/Planting';
import Reports from './pages/Reports';
import Simulation from './pages/Simulation';
import Settings from './pages/Settings';
import Admin from './pages/Admin';
import Alerts from './pages/Alerts';

// Context
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AlertProvider } from './context/AlertContext';

function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if we're in demo mode (auth is null)
    if (!auth) {
      // Demo mode - check for demo user in localStorage
      const checkDemoUser = () => {
        const demoUser = localStorage.getItem('demoUser');
        if (demoUser) {
          const userData = JSON.parse(demoUser);
          setUser({ uid: userData.userId, email: userData.email, displayName: userData.name });
          setUserData(userData);
        } else {
          setUser(null);
          setUserData(null);
        }
        setLoading(false);
      };

      // Check initially
      checkDemoUser();

      // Listen for storage changes (when login sets localStorage)
      const handleStorageChange = (e) => {
        if (e.key === 'demoUser' || e.key === null) {
          checkDemoUser();
        }
      };

      window.addEventListener('storage', handleStorageChange);
      
      // Also listen for custom event (for same-tab updates)
      const handleCustomStorageChange = () => {
        checkDemoUser();
      };
      window.addEventListener('localStorageChange', handleCustomStorageChange);

      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('localStorageChange', handleCustomStorageChange);
      };
    }

    // Real Firebase mode
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const result = await getUserData(user.uid);
        if (result.success) {
          setUserData(result.data);
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <ThemeProvider>
        <Login />
      </ThemeProvider>
    );
  }

  return (
    <AuthProvider value={{ user, userData }}>
      <ThemeProvider>
        <AlertProvider>
          <Router>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
              <Navbar />
              <div className="flex">
                <Sidebar />
                <main className="flex-1 p-6 ml-64">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/monitoring" element={<Monitoring />} />
                    <Route path="/watering" element={<Watering />} />
                    <Route path="/planting" element={<Planting />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/simulation" element={<Simulation />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/alerts" element={<Alerts />} />
                    {userData?.role === 'admin' && (
                      <Route path="/admin" element={<Admin />} />
                    )}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>
              </div>
            </div>
          </Router>
        </AlertProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
