import React, { useState } from 'react';
import { Eye, EyeOff, LogIn, UserPlus, AlertCircle, Leaf } from 'lucide-react';
import { signIn, signUp } from '../firebase/auth';

const Login = () => {
  const [isLogin,   setIsLogin]   = useState(true);
  const [formData,  setFormData]  = useState({ email: '', password: '', name: '', role: 'staff' });
  const [showPass,  setShowPass]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = isLogin
      ? await signIn(formData.email, formData.password)
      : await signUp(formData.email, formData.password, formData.name, formData.role);

    if (result.success) {
      window.location.reload();
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2
                        w-[700px] h-[700px] bg-blue-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px]
                        bg-primary-200/30 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-slide-up">

        {/* Card — white, rounded, soft shadow */}
        <div className="bg-white rounded-3xl border border-blue-100 shadow-card-hover p-8">

          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="h-14 w-14 rounded-2xl bg-primary-600 flex items-center
                            justify-center shadow-glow-sm mb-4">
              <Leaf className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[#1e3a8a] tracking-tight">
              SAPRO Dashboard
            </h1>
            <p className="text-slate-500 text-sm mt-1 text-center">
              Smart Greenhouse Management System
            </p>
          </div>

          {/* Tab switcher — pill style */}
          <div className="flex bg-blue-50 rounded-full p-1 mb-6 gap-1">
            {['Sign In', 'Sign Up'].map((label, i) => {
              const active = isLogin ? i === 0 : i === 1;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => { setIsLogin(i === 0); setError(''); }}
                  className={`flex-1 py-2 text-sm font-semibold rounded-full
                              transition-all duration-200
                              ${active
                                ? 'bg-[#1e3a8a] text-white shadow-pill'
                                : 'text-slate-500 hover:text-[#1e3a8a]'}`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Demo credentials */}
          <div className="mb-5 px-4 py-2.5 rounded-xl bg-blue-50 border border-blue-100
                          text-[11px] text-slate-500 text-center leading-relaxed">
            Demo: <span className="text-primary-600 font-mono font-medium">admin@demo.com</span>
            {' '}/ <span className="text-primary-600 font-mono font-medium">admin123</span>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 flex items-start gap-3 px-4 py-3 rounded-xl
                            bg-red-50 border border-red-200 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="input-label">Full Name</label>
                <input id="name" name="name" type="text" required={!isLogin}
                  value={formData.name} onChange={handleChange}
                  className="input-field" placeholder="Your full name" />
              </div>
            )}

            <div>
              <label htmlFor="email" className="input-label">Email Address</label>
              <input id="email" name="email" type="email" required
                value={formData.email} onChange={handleChange}
                className="input-field" placeholder="you@example.com" />
            </div>

            <div>
              <label htmlFor="password" className="input-label">Password</label>
              <div className="relative">
                <input id="password" name="password"
                  type={showPass ? 'text' : 'password'} required
                  value={formData.password} onChange={handleChange}
                  className="input-field pr-11" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                             text-slate-400 hover:text-slate-600 transition-colors">
                  {showPass
                    ? <EyeOff className="h-4.5 w-4.5" />
                    : <Eye    className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="role" className="input-label">Role</label>
                <select id="role" name="role" value={formData.role} onChange={handleChange}
                  className="input-field">
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="btn-primary w-full mt-2">
              {loading ? (
                <div className="h-5 w-5 rounded-full border-2 border-white
                                border-t-transparent animate-spin" />
              ) : isLogin ? (
                <><LogIn className="h-4.5 w-4.5" /> Sign In</>
              ) : (
                <><UserPlus className="h-4.5 w-4.5" /> Create Account</>
              )}
            </button>
          </form>

          {isLogin && (
            <div className="text-center mt-4">
              <button className="text-xs text-primary-600 hover:text-primary-700
                                  font-medium transition-colors">
                Forgot your password?
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-[11px] text-slate-400 mt-4">
          SAPRO v1.0 — Smart Greenhouse Management System
        </p>
      </div>
    </div>
  );
};

export default Login;
