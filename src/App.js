import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/firebaseConfig';
import { getUserData } from './firebase/auth';

// Components
import Navbar from './components/Navbar';
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
  const [user,     setUser]     = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!auth) {
      const checkDemoUser = () => {
        const raw = localStorage.getItem('demoUser');
        if (raw) {
          const d = JSON.parse(raw);
          setUser({ uid: d.userId, email: d.email, displayName: d.name });
          setUserData(d);
        } else {
          setUser(null);
          setUserData(null);
        }
        setLoading(false);
      };

      checkDemoUser();

      const onStorage = (e) => { if (e.key === 'demoUser' || e.key === null) checkDemoUser(); };
      const onCustom  = ()  => checkDemoUser();
      window.addEventListener('storage', onStorage);
      window.addEventListener('localStorageChange', onCustom);
      return () => {
        window.removeEventListener('storage', onStorage);
        window.removeEventListener('localStorageChange', onCustom);
      };
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const result = await getUserData(user.uid);
        if (result.success) setUserData(result.data);
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /* ── Loading screen ── */
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-blue-50">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2
                          w-96 h-96 bg-primary-200/50 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64
                          bg-blue-200/30 rounded-full blur-3xl" />
        </div>
        <div className="relative flex flex-col items-center gap-5">
          <div className="h-14 w-14 rounded-2xl bg-primary-600 flex items-center
                          justify-center shadow-glow-green">
            <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M12 3v1m0 16v1M4.22 4.22l.707.707m12.728 12.728.707.707
                   M1 12h1m20 0h1M4.22 19.78l.707-.707M18.364 5.636l.707-.707
                   M12 8a4 4 0 100 8 4 4 0 000-8z" />
            </svg>
          </div>
          <div className="flex items-center gap-2">
            {[0, 150, 300].map((delay) => (
              <div key={delay}
                className="h-2 w-2 rounded-full bg-primary-500 animate-bounce"
                style={{ animationDelay: `${delay}ms` }} />
            ))}
          </div>
          <p className="text-slate-500 text-sm">Loading SAPRO Dashboard…</p>
        </div>
      </div>
    );
  }

  /* ── Login ── */
  if (!user) {
    return (
      <ThemeProvider>
        <Login />
      </ThemeProvider>
    );
  }

  /* ── Authenticated app ── */
  return (
    <AuthProvider value={{ user, userData }}>
      <ThemeProvider>
        <AlertProvider>
          <Router>
            {/* Global ambient background */}
            <div className="min-h-screen bg-blue-50 relative">
              <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="absolute top-0 left-1/4 w-[700px] h-[700px]
                                bg-blue-200/25 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px]
                                bg-primary-200/20 rounded-full blur-3xl" />
              </div>

              {/* Floating top navbar */}
              <Navbar />

              {/* Main content — full width, centered, padded for pill nav */}
              <main className="pt-24 pb-12 animate-fade-in">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <Routes>
                    <Route path="/"           element={<Dashboard />} />
                    <Route path="/dashboard"  element={<Dashboard />} />
                    <Route path="/monitoring" element={<Monitoring />} />
                    <Route path="/watering"   element={<Watering />} />
                    <Route path="/planting"   element={<Planting />} />
                    <Route path="/reports"    element={<Reports />} />
                    <Route path="/simulation" element={<Simulation />} />
                    <Route path="/settings"   element={<Settings />} />
                    <Route path="/alerts"     element={<Alerts />} />
                    {userData?.role === 'admin' && (
                      <Route path="/admin" element={<Admin />} />
                    )}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </div>
              </main>

              {/* Footer */}
              <footer className="border-t border-blue-100 bg-white/60 backdrop-blur-sm py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
                                flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-lg bg-primary-600 flex items-center
                                    justify-center">
                      <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24"
                           stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                          d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9z
                             M12 8v4l3 3" />
                      </svg>
                    </div>
                    <span className="text-sm font-semibold text-[#1e3a8a]">SAPRO</span>
                    <span className="text-xs text-slate-400">Smart Greenhouse Management v1.0</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    © {new Date().getFullYear()} SAPRO Dashboard. All rights reserved.
                  </p>
                </div>
              </footer>
            </div>
          </Router>
        </AlertProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
