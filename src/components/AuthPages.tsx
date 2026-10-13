import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { BrandLogo } from './BrandLogo';
import { INITIAL_USERS } from '../data/mockData';
import { AlertCircle, ArrowLeft, CheckCircle2, Shield, Info } from 'lucide-react';

interface AuthPagesProps {
  onLoginSuccess: (user: User) => void;
  onRegisterSuccess: (user: User) => void;
  initialView?: 'landing' | 'login' | 'signup';
}

export const AuthPages: React.FC<AuthPagesProps> = ({
  onLoginSuccess,
  onRegisterSuccess,
  initialView = 'landing',
}) => {
  const [view, setView] = useState<'landing' | 'login' | 'signup'>(initialView);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupRole, setSignupRole] = useState<UserRole>('officer');
  const [signupError, setSignupError] = useState<string | null>(null);

  // Forgot password flow
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Handle Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!loginEmail || !loginPassword) {
      setLoginError('Please enter both email address and password.');
      return;
    }

    // Check against initial users or allow campus domain
    const matched = INITIAL_USERS.find(
      (u) => u.email.toLowerCase() === loginEmail.toLowerCase().trim()
    );

    if (matched) {
      onLoginSuccess(matched);
    } else if (loginEmail.includes('@')) {
      // Allow dynamic campus login
      const newUser: User = {
        id: `usr-${Date.now().toString(36)}`,
        name: loginEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        email: loginEmail.trim(),
        role: 'officer',
        department: 'Campus Emergency Communication Center',
        createdAt: new Date().toISOString(),
      };
      onLoginSuccess(newUser);
    } else {
      setLoginError('Invalid email credentials. Please enter a valid campus email address.');
    }
  };

  // Handle Signup
  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(null);

    if (!signupName.trim()) {
      setSignupError('Please enter your full name.');
      return;
    }
    if (!signupEmail.trim() || !signupEmail.includes('@')) {
      setSignupError('Please enter a valid campus email address.');
      return;
    }
    if (signupPassword.length < 6) {
      setSignupError('Password must be at least 6 characters.');
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      setSignupError('Passwords do not match.');
      return;
    }

    const newUser: User = {
      id: `usr-${Date.now().toString(36)}`,
      name: signupName.trim(),
      email: signupEmail.trim(),
      role: signupRole,
      department: signupRole === 'admin' 
        ? 'University Administration' 
        : signupRole === 'staff' 
        ? 'Campus DRRM Unit' 
        : 'Public Information Office (PIO)',
      createdAt: new Date().toISOString(),
    };

    onRegisterSuccess(newUser);
  };

  // Quick Demo Login helper
  const handleQuickDemoLogin = (user: User) => {
    onLoginSuccess(user);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between p-4 sm:p-8 font-['Outfit'] select-none">
      
      {/* =========================================================================
          VIEW A: LANDING SCREEN (Pixel-matched to Landing.png)
         ========================================================================= */}
      {view === 'landing' && (
        <div className="flex-1 flex flex-col items-center justify-between max-w-[420px] mx-auto w-full py-8 sm:py-16">
          
          {/* Top spacer with system badge */}
          <div className="w-full flex justify-between items-center text-xs text-neutral-400">
            <span className="font-semibold text-neutral-700 tracking-wide">CARAGA STATE UNIVERSITY</span>
            <span className="text-[11px] bg-red-50 text-[#D00000] px-2 py-0.5 rounded font-bold">SMS BROADCAST</span>
          </div>

          {/* Centered Big Brand Logo - exactly matching Landing.png */}
          <div className="my-auto text-center py-12">
            <BrandLogo size="hero" />
            <p className="text-xs sm:text-sm text-neutral-500 font-normal tracking-wide mt-3 max-w-[300px] mx-auto">
              University Emergency & Advisory SMS Notification System
            </p>
          </div>

          {/* Bottom Action Buttons - exactly matching Landing.png */}
          <div className="w-full space-y-3.5">
            <button
              type="button"
              onClick={() => setView('login')}
              className="w-full py-3.5 sm:py-4 bg-[#D00000] hover:bg-[#B50000] active:scale-[0.99] text-white font-extrabold text-sm sm:text-base tracking-wider rounded-lg shadow-sm transition-all cursor-pointer"
            >
              LOG IN
            </button>

            <button
              type="button"
              onClick={() => setView('signup')}
              className="w-full py-3.5 sm:py-4 bg-[#D6D8DC] hover:bg-[#CBCED3] active:scale-[0.99] text-[#D00000] font-extrabold text-sm sm:text-base tracking-wider rounded-lg transition-all cursor-pointer"
            >
              SIGN UP
            </button>

            {/* Quick 1-Click Evaluator Access */}
            <div className="pt-4 border-t border-neutral-100 text-center">
              <span className="text-[11px] text-neutral-400 block mb-2 font-medium">Quick 1-Click Access for Reviewers:</span>
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin(INITIAL_USERS[0])}
                  className="text-xs px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded font-medium transition-colors cursor-pointer"
                >
                  Officer Cruz (PIO)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin(INITIAL_USERS[1])}
                  className="text-xs px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded font-medium transition-colors cursor-pointer"
                >
                  Dr. Santos (Admin)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW B: LOGIN SCREEN (Pixel-matched to Login.png)
         ========================================================================= */}
      {view === 'login' && (
        <div className="flex-1 flex flex-col justify-between max-w-[420px] mx-auto w-full py-6 sm:py-12">
          {/* Top Left Title: LOGIN */}
          <div className="flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl font-normal tracking-wide text-neutral-900 uppercase">
              LOGIN
            </h1>
            <button
              type="button"
              onClick={() => setView('landing')}
              className="text-xs text-neutral-400 hover:text-neutral-700 flex items-center gap-1 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          </div>

          {/* Centered Brand Logo */}
          <div className="my-8 text-center">
            <BrandLogo size="xl" />
          </div>

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {loginError && (
              <div className="p-3 bg-red-50 text-[#D00000] text-xs rounded-xl flex items-center gap-2 border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full px-4 py-3.5 text-sm rounded-xl border border-neutral-300 focus:border-[#D00000] text-neutral-800 placeholder-neutral-400 focus:outline-none transition-all shadow-xs"
              />
            </div>

            <div>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-3.5 text-sm rounded-xl border border-neutral-300 focus:border-[#D00000] text-neutral-800 placeholder-neutral-400 focus:outline-none transition-all shadow-xs"
              />
              <div className="mt-2 text-right">
                <button
                  type="button"
                  onClick={() => setForgotPasswordOpen(true)}
                  className="text-xs font-medium text-neutral-800 hover:text-[#D00000] transition-colors"
                >
                  Forget Password ?
                </button>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full py-3.5 bg-[#D00000] hover:bg-[#B50000] active:scale-[0.99] text-white font-extrabold text-sm sm:text-base tracking-wider rounded-lg shadow-sm transition-all cursor-pointer"
              >
                LOG IN
              </button>
            </div>

            {/* Quick fills */}
            <div className="pt-2 text-center">
              <span className="text-[11px] text-neutral-400 block mb-1">Click to autofill credentials:</span>
              <button
                type="button"
                onClick={() => {
                  setLoginEmail('pio.cruz@carsu.edu.ph');
                  setLoginPassword('password123');
                }}
                className="text-xs text-[#D00000] font-semibold hover:underline"
              >
                Autofill PIO Cruz (pio.cruz@carsu.edu.ph)
              </button>
            </div>
          </form>

          {/* Bottom Link: Not register yet ? Sign up */}
          <div className="pt-8 text-center text-xs text-neutral-600 font-medium">
            Not register yet ?{' '}
            <button
              type="button"
              onClick={() => setView('signup')}
              className="font-bold text-neutral-900 hover:text-[#D00000] transition-colors cursor-pointer"
            >
              Sign up
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW C: SIGN UP SCREEN (Pixel-matched to Sign-up.png)
         ========================================================================= */}
      {view === 'signup' && (
        <div className="flex-1 flex flex-col justify-between max-w-[420px] mx-auto w-full py-6 sm:py-10">
          {/* Top Left Title: SIGN UP */}
          <div className="flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl font-normal tracking-wide text-neutral-900 uppercase">
              SIGN UP
            </h1>
            <button
              type="button"
              onClick={() => setView('landing')}
              className="text-xs text-neutral-400 hover:text-neutral-700 flex items-center gap-1 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          </div>

          {/* Centered Brand Logo */}
          <div className="my-6 text-center">
            <BrandLogo size="lg" />
          </div>

          {/* Form */}
          <form onSubmit={handleSignupSubmit} className="space-y-3.5">
            {signupError && (
              <div className="p-3 bg-red-50 text-[#D00000] text-xs rounded-xl flex items-center gap-2 border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{signupError}</span>
              </div>
            )}

            <div>
              <input
                type="text"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                placeholder="Enter name"
                className="w-full px-4 py-3 text-sm rounded-xl border border-neutral-300 focus:border-[#D00000] text-neutral-800 placeholder-neutral-400 focus:outline-none transition-all shadow-xs"
              />
            </div>

            <div>
              <input
                type="email"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                placeholder="Enter email"
                className="w-full px-4 py-3 text-sm rounded-xl border border-neutral-300 focus:border-[#D00000] text-neutral-800 placeholder-neutral-400 focus:outline-none transition-all shadow-xs"
              />
            </div>

            <div>
              <input
                type="password"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-3 text-sm rounded-xl border border-neutral-300 focus:border-[#D00000] text-neutral-800 placeholder-neutral-400 focus:outline-none transition-all shadow-xs"
              />
            </div>

            <div>
              <input
                type="password"
                value={signupConfirmPassword}
                onChange={(e) => setSignupConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="w-full px-4 py-3 text-sm rounded-xl border border-neutral-300 focus:border-[#D00000] text-neutral-800 placeholder-neutral-400 focus:outline-none transition-all shadow-xs"
              />
            </div>

            {/* Role Foundation (RBAC) */}
            <div>
              <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wide mb-1">
                Campus Dispatch Role
              </label>
              <select
                value={signupRole}
                onChange={(e) => setSignupRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg bg-neutral-50 text-neutral-800 font-medium focus:outline-none focus:border-[#D00000]"
              >
                <option value="officer">Public Information Officer (PIO Broadcast Authority)</option>
                <option value="admin">System Administrator (Full Campus Control)</option>
                <option value="staff">Campus DRRM Staff (Disaster Risk Reduction)</option>
              </select>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                className="w-full py-3.5 bg-[#D00000] hover:bg-[#B50000] active:scale-[0.99] text-white font-extrabold text-sm sm:text-base tracking-wider rounded-lg shadow-sm transition-all cursor-pointer"
              >
                SIGN UP
              </button>
            </div>
          </form>

          {/* Bottom Link: Already have an account ? Log in */}
          <div className="pt-6 text-center text-xs text-neutral-600 font-medium">
            Already have an account ?{' '}
            <button
              type="button"
              onClick={() => setView('login')}
              className="font-bold text-neutral-900 hover:text-[#D00000] transition-colors cursor-pointer"
            >
              Log in
            </button>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {forgotPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl border border-neutral-100">
            <h4 className="text-lg font-bold text-neutral-900 mb-1">Reset Account Password</h4>
            <p className="text-xs text-neutral-500 mb-4">
              Enter your campus email to receive security recovery instructions
            </p>

            {forgotSent ? (
              <div className="py-4 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                <p className="text-xs font-semibold text-neutral-800">
                  Password reset link sent to your university inbox.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setForgotPasswordOpen(false);
                    setForgotSent(false);
                  }}
                  className="mt-4 px-4 py-2 text-xs font-bold text-white bg-[#D00000] rounded-lg"
                >
                  Return to Login
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="Enter university email address"
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:border-[#D00000]"
                />
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotPasswordOpen(false)}
                    className="px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setForgotSent(true)}
                    className="px-4 py-1.5 text-xs font-bold text-white bg-[#D00000] hover:bg-[#B50000] rounded-lg"
                  >
                    Send Reset Link
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
