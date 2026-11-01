/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  Shield,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
} from 'firebase/auth';
import { auth, db } from '../../lib/firebase.ts';
import { useAuth, BOOTSTRAP_ADMIN_EMAIL } from '../../context/AuthContext.tsx';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export type AuthMode = 'login' | 'register' | 'forgot_password' | 'admin_login';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onSuccess,
}) => {
  const { sendResetPassword } = useAuth();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setDisplayName('');
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleSwitchMode = (newMode: AuthMode) => {
    setMode(newMode);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (mode === 'register') {
        if (!displayName.trim()) {
          setErrorMessage('Please enter your full name or username.');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setErrorMessage('Password must be at least 6 characters long.');
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setErrorMessage('Passwords do not match.');
          setLoading(false);
          return;
        }

        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await updateProfile(cred.user, { displayName: displayName.trim() });

        try {
          await sendEmailVerification(cred.user);
        } catch {
          // Verification optional failure handling
        }

        setSuccessMessage('Account registered successfully! Welcome to Zentro.');
        setTimeout(() => {
          onClose();
          onSuccess?.();
        }, 1200);
      } else if (mode === 'login' || mode === 'admin_login') {
        const cred = await signInWithEmailAndPassword(auth, email.trim(), password);

        // If admin login mode, verify admin privilege
        if (mode === 'admin_login') {
          const userEmail = cred.user.email?.toLowerCase();
          let isAuthorizedAdmin = userEmail === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();

          if (!isAuthorizedAdmin) {
            try {
              const adminDoc = await getDoc(doc(db, 'admins', cred.user.uid));
              if (adminDoc.exists()) {
                isAuthorizedAdmin = true;
              }
            } catch {}
          }

          if (!isAuthorizedAdmin) {
            setErrorMessage('Access Denied: This account does not possess administrator privileges.');
            setLoading(false);
            return;
          }
        }

        setSuccessMessage('Successfully authenticated.');
        setTimeout(() => {
          onClose();
          onSuccess?.();
        }, 800);
      } else if (mode === 'forgot_password') {
        if (!email.trim()) {
          setErrorMessage('Please enter your email address.');
          setLoading(false);
          return;
        }
        await sendResetPassword(email.trim());
        setSuccessMessage(`Password reset link dispatched to ${email}. Check your inbox.`);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      let msg = 'Authentication failed. Please verify credentials.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Invalid email or password.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'An account with this email address already exists. Please log in.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password is too weak. Must be at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Please enter a valid email address.';
      }
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="relative w-full max-w-md rounded-2xl bg-[#101828] border border-[#2A3649] p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-[#1C2433]"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Brand Lockup */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-xl overflow-hidden border border-[#D4AF37]/50 bg-[#080B12] shadow-lg flex items-center justify-center">
            <img
              src="/assets/aistudio/1793501521967_95ee68fd.jpg"
              alt="Zentro Gold Z Logo"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div>
            <h2 className="text-xl font-bold font-['Outfit'] text-white">
              {mode === 'login' && 'Sign In to Zentro'}
              {mode === 'register' && 'Create Your Zentro Account'}
              {mode === 'forgot_password' && 'Reset Account Password'}
              {mode === 'admin_login' && 'Administrator Portal Login'}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {mode === 'login' && 'Access tasks, games, and your practice Demo Credits'}
              {mode === 'register' && 'Join the next-generation skill and task rewards ecosystem'}
              {mode === 'forgot_password' && 'Enter your registered email to receive a secure reset link'}
              {mode === 'admin_login' && 'Restricted access for platform administrators'}
            </p>
          </div>
        </div>

        {/* Feedback Messages */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 text-xs text-[#10B981] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Display Name / Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Alex Morgan"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#1C2433] border border-[#2A3649] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              {mode === 'admin_login' ? 'Admin Gmail / Email' : 'Email Address'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2.5 bg-[#1C2433] border border-[#2A3649] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]"
                required
              />
            </div>
          </div>

          {mode !== 'forgot_password' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-gray-300">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('forgot_password')}
                    className="text-[11px] text-[#D4AF37] hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-9 py-2.5 bg-[#1C2433] border border-[#2A3649] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#1C2433] border border-[#2A3649] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]"
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C29D2C] hover:from-[#E5C358] hover:to-[#D4AF37] text-[#080B12] text-xs font-bold transition-all shadow-lg shadow-[#D4AF37]/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : mode === 'register' ? (
              <span>Create Account</span>
            ) : mode === 'forgot_password' ? (
              <span>Send Reset Instructions</span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Bottom Mode Switcher */}
        <div className="pt-2 border-t border-[#2A3649] text-center text-xs text-gray-400 space-y-2">
          {mode === 'login' && (
            <p>
              Don't have an account yet?{' '}
              <button
                onClick={() => handleSwitchMode('register')}
                className="text-[#D4AF37] font-semibold hover:underline"
              >
                Register Here
              </button>
            </p>
          )}

          {mode === 'register' && (
            <p>
              Already have an account?{' '}
              <button
                onClick={() => handleSwitchMode('login')}
                className="text-[#D4AF37] font-semibold hover:underline"
              >
                Sign In
              </button>
            </p>
          )}

          {mode === 'forgot_password' && (
            <p>
              Remembered your credentials?{' '}
              <button
                onClick={() => handleSwitchMode('login')}
                className="text-[#D4AF37] font-semibold hover:underline"
              >
                Back to Sign In
              </button>
            </p>
          )}

          {/* Admin Login Switcher */}
          <div className="pt-1">
            {mode === 'admin_login' ? (
              <button
                onClick={() => handleSwitchMode('login')}
                className="text-[11px] text-gray-400 hover:text-white"
              >
                ← Return to User Login
              </button>
            ) : (
              <button
                onClick={() => handleSwitchMode('admin_login')}
                className="text-[11px] text-gray-500 hover:text-[#D4AF37] flex items-center justify-center gap-1 mx-auto"
              >
                <Shield className="w-3 h-3" />
                <span>Admin Login Portal</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
