/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Menu, Bell, Coins, UserCircle, Shield, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { ActiveTab } from './Sidebar.tsx';

interface TopHeaderProps {
  activeTab: ActiveTab;
  onOpenMobileSidebar: () => void;
  onOpenNotifications: () => void;
  onOpenAuth: () => void;
  collapsed: boolean;
}

const TAB_TITLES: Record<ActiveTab, { title: string; subtitle: string }> = {
  home: { title: 'Dashboard', subtitle: 'Overview & Quick Navigation' },
  tasks: { title: 'Earn Tasks', subtitle: 'Task Marketplace & Submissions' },
  games: { title: 'Skill Games', subtitle: 'Interactive Challenges & Practice Credits' },
  youtube: { title: 'YouTube Tasks', subtitle: 'Educational Video Quizzes' },
  wallet: { title: 'Wallet', subtitle: 'Demo Credit Balance & Ledger' },
  transactions: { title: 'History', subtitle: 'Complete Transaction Audit' },
  profile: { title: 'My Profile', subtitle: 'Account Credentials & Performance' },
  settings: { title: 'Settings', subtitle: 'Preferences & Security' },
  support: { title: 'Help & Support', subtitle: 'Knowledge Base & Inquiries' },
  admin: { title: 'Admin Console', subtitle: 'Platform Management & Moderation' },
};

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeTab,
  onOpenMobileSidebar,
  onOpenNotifications,
  onOpenAuth,
  collapsed,
}) => {
  const { currentUser, userProfile, isAdmin, unreadNotificationCount } = useAuth();
  const currentInfo = TAB_TITLES[activeTab] || { title: 'Zentro', subtitle: 'Earning Platform' };

  return (
    <header
      className={`sticky top-0 z-20 h-16 bg-[#080B12]/90 backdrop-blur-md border-b border-[#2A3649] transition-all duration-300 ${
        collapsed ? 'md:pl-20' : 'md:pl-64'
      }`}
    >
      <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & Breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onOpenMobileSidebar}
            className="md:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-[#1C2433] focus:outline-none"
            aria-label="Open sidebar menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold font-['Outfit'] text-white truncate flex items-center gap-2">
              {currentInfo.title}
              {activeTab === 'admin' && (
                <span className="text-[10px] font-mono tracking-wider text-[#D4AF37] bg-[#D4AF37]/15 border border-[#D4AF37]/30 px-1.5 py-0.5 rounded uppercase">
                  Protected
                </span>
              )}
            </h1>
            <p className="hidden sm:block text-xs text-gray-400 truncate">
              {currentInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Balance Pill, Notifications & Profile */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Email verification reminder banner if user is signed in but email not verified */}
          {currentUser && !currentUser.emailVerified && (
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-amber-400/90 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>Email unverified</span>
            </div>
          )}

          {/* Demo Credits Balance */}
          {currentUser && (
            <div
              title="Practice Demo Credits (No Cash Value)"
              className="flex items-center gap-2 bg-[#1C2433] border border-[#2A3649] px-3 py-1.5 rounded-lg shadow-inner"
            >
              <div className="w-5 h-5 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37]">
                <Coins className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col text-right">
                <span className="text-xs font-bold font-mono tabular-nums text-white leading-none">
                  {userProfile ? userProfile.demoCredits.toLocaleString() : '0'}
                </span>
                <span className="text-[9px] font-mono text-[#D4AF37] leading-none uppercase">
                  Demo
                </span>
              </div>
            </div>
          )}

          {/* In-App Notifications Button */}
          {currentUser && (
            <button
              onClick={onOpenNotifications}
              className="relative p-2 text-gray-300 hover:text-white rounded-lg hover:bg-[#1C2433] border border-transparent hover:border-[#2A3649] transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotificationCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#10B981] text-black font-bold text-[10px] flex items-center justify-center font-mono">
                  {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                </span>
              )}
            </button>
          )}

          {/* Admin badge quick indicator */}
          {isAdmin && (
            <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/30 px-2 py-1 rounded-lg">
              <Shield className="w-3.5 h-3.5" />
              <span>Admin</span>
            </div>
          )}

          {/* User Profile / Login Button */}
          {!currentUser ? (
            <button
              onClick={onOpenAuth}
              className="px-3.5 py-1.5 rounded-lg bg-[#D4AF37] hover:bg-[#E5C358] text-[#080B12] font-semibold text-xs tracking-wide transition-all shadow-md"
            >
              Sign In
            </button>
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#1C2433] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] font-bold text-xs uppercase overflow-hidden">
              {userProfile?.photoURL ? (
                <img
                  src={userProfile.photoURL}
                  alt={userProfile.displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                userProfile?.displayName?.charAt(0) || <UserCircle className="w-5 h-5" />
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
