/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  User,
  Mail,
  Calendar,
  CheckSquare,
  Gamepad2,
  Coins,
  Shield,
  KeyRound,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Save,
  Image,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';

interface ProfileViewProps {
  onOpenAuth: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onOpenAuth }) => {
  const {
    currentUser,
    userProfile,
    isAdmin,
    updateUserDisplayName,
    sendResetPassword,
    resendVerificationEmail,
    logout,
  } = useAuth();

  const [displayName, setDisplayName] = useState<string>(userProfile?.displayName || '');
  const [photoURL, setPhotoURL] = useState<string>(userProfile?.photoURL || '');
  const [saving, setSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [resetSent, setResetSent] = useState<boolean>(false);
  const [verifySent, setVerifySent] = useState<boolean>(false);

  if (!currentUser || !userProfile) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 rounded-2xl bg-[#1C2433] border border-[#2A3649] text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] mx-auto">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold font-['Outfit'] text-white">Sign In to View Profile</h2>
        <p className="text-xs text-gray-300">
          Create an account or sign in to track your Demo Credits, task history, and security settings.
        </p>
        <button
          onClick={onOpenAuth}
          className="px-6 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C358] text-[#080B12] font-bold text-xs"
        >
          Sign In / Register
        </button>
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setMessage({ type: 'error', text: 'Display name cannot be empty.' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      await updateUserDisplayName(displayName.trim(), photoURL.trim() || undefined);
      setMessage({ type: 'success', text: 'Profile updated successfully.' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!currentUser.email) return;
    try {
      await sendResetPassword(currentUser.email);
      setResetSent(true);
      setMessage({
        type: 'success',
        text: `Password reset email dispatched to ${currentUser.email}.`,
      });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to send password reset email.' });
    }
  };

  const handleResendVerification = async () => {
    try {
      await resendVerificationEmail();
      setVerifySent(true);
      setMessage({
        type: 'success',
        text: 'Verification link sent to your email address.',
      });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to send verification email.' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold font-['Outfit'] text-white">
          User Profile & Security
        </h1>
        <p className="text-xs text-gray-400">
          Manage your personal credentials, identity settings, and performance statistics.
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-xs ${
            message.type === 'success'
              ? 'bg-[#10B981]/15 border border-[#10B981]/40 text-[#10B981]'
              : 'bg-red-500/15 border border-red-500/40 text-red-300'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Top Profile Summary Card */}
      <div className="p-6 rounded-2xl bg-[#1C2433] border border-[#2A3649] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-[#101828] border-2 border-[#D4AF37] flex items-center justify-center text-[#D4AF37] font-bold text-2xl uppercase overflow-hidden shadow-xl shrink-0">
            {userProfile.photoURL ? (
              <img
                src={userProfile.photoURL}
                alt={userProfile.displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              userProfile.displayName.charAt(0)
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold font-['Outfit'] text-white">
                {userProfile.displayName}
              </h2>
              {isAdmin && (
                <span className="text-[10px] uppercase font-mono font-bold bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 px-2 py-0.5 rounded">
                  Administrator
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 flex items-center gap-1.5 font-mono">
              <Mail className="w-3.5 h-3.5 text-gray-500" />
              <span>{currentUser.email}</span>
            </p>
            <p className="text-xs text-gray-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-gray-500" />
              <span>Joined {new Date(userProfile.createdAt).toLocaleDateString()}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={logout}
            className="px-4 py-2 rounded-xl bg-[#101828] hover:bg-red-500/20 text-gray-300 hover:text-red-400 border border-[#2A3649] text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Profile Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#1C2433] border border-[#2A3649]">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Demo Credits</span>
            <Coins className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-white">
            {userProfile.demoCredits.toLocaleString()}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#1C2433] border border-[#2A3649]">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Lifetime Earned</span>
            <Coins className="w-4 h-4 text-[#10B981]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-[#10B981]">
            +{userProfile.totalEarned.toLocaleString()}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#1C2433] border border-[#2A3649]">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Tasks Completed</span>
            <CheckSquare className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-white">
            {userProfile.tasksCompleted}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#1C2433] border border-[#2A3649]">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Games Played</span>
            <Gamepad2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-white">
            {userProfile.gamesPlayed || 0}
          </div>
        </div>
      </div>

      {/* Edit Profile Form */}
      <div className="p-6 rounded-2xl bg-[#1C2433] border border-[#2A3649] space-y-4">
        <h3 className="text-base font-bold font-['Outfit'] text-white">Edit Profile Details</h3>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Full / Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full p-2.5 bg-[#101828] border border-[#2A3649] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Avatar Image URL <span className="text-gray-500">(Optional)</span>
              </label>
              <input
                type="url"
                value={photoURL}
                onChange={(e) => setPhotoURL(e.target.value)}
                placeholder="https://images.example.com/avatar.jpg"
                className="w-full p-2.5 bg-[#101828] border border-[#2A3649] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#E5C358] text-[#080B12] text-xs font-bold transition-all shadow-md flex items-center gap-2"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Security & Credentials */}
      <div className="p-6 rounded-2xl bg-[#1C2433] border border-[#2A3649] space-y-4">
        <h3 className="text-base font-bold font-['Outfit'] text-white">Account Security</h3>

        <div className="divide-y divide-[#2A3649]">
          {/* Email Verification */}
          <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-white">Email Address Verification</p>
              <p className="text-[11px] text-gray-400">
                {currentUser.emailVerified
                  ? 'Your email address is verified with Firebase Authentication.'
                  : 'Your email address has not yet been verified.'}
              </p>
            </div>
            {!currentUser.emailVerified && (
              <button
                onClick={handleResendVerification}
                disabled={verifySent}
                className="px-3.5 py-1.5 rounded-lg bg-[#101828] hover:bg-[#222C3D] text-amber-300 border border-amber-500/30 text-xs font-medium self-start disabled:opacity-50"
              >
                {verifySent ? 'Verification Link Sent' : 'Send Verification Email'}
              </button>
            )}
          </div>

          {/* Password Reset */}
          <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-white">Account Password</p>
              <p className="text-[11px] text-gray-400">
                Request a password reset link sent to your registered Gmail / Email address.
              </p>
            </div>
            <button
              onClick={handlePasswordReset}
              disabled={resetSent}
              className="px-3.5 py-1.5 rounded-lg bg-[#101828] hover:bg-[#222C3D] text-gray-200 border border-[#2A3649] text-xs font-medium self-start disabled:opacity-50 flex items-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{resetSent ? 'Link Dispatched' : 'Reset Password'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
