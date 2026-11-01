/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Gamepad2,
  Tv,
  Wallet,
  History,
  User,
  Settings,
  HelpCircle,
  Shield,
  LogOut,
  X,
  Coins,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';

export type ActiveTab =
  | 'home'
  | 'tasks'
  | 'games'
  | 'youtube'
  | 'wallet'
  | 'transactions'
  | 'profile'
  | 'settings'
  | 'support'
  | 'admin';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  onOpenAuth: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  mobileOpen,
  setMobileOpen,
  collapsed,
  setCollapsed,
  onOpenAuth,
}) => {
  const { currentUser, userProfile, isAdmin, logout } = useAuth();

  const navItems = [
    { id: 'home' as ActiveTab, label: 'Home', icon: LayoutDashboard },
    { id: 'tasks' as ActiveTab, label: 'Earn Tasks', icon: CheckSquare },
    { id: 'games' as ActiveTab, label: 'Skill Games', icon: Gamepad2 },
    { id: 'youtube' as ActiveTab, label: 'YouTube Tasks', icon: Tv },
    { id: 'wallet' as ActiveTab, label: 'Wallet', icon: Wallet },
    { id: 'transactions' as ActiveTab, label: 'History', icon: History },
    { id: 'profile' as ActiveTab, label: 'Profile', icon: User },
    { id: 'settings' as ActiveTab, label: 'Settings', icon: Settings },
    { id: 'support' as ActiveTab, label: 'Help & Support', icon: HelpCircle },
    {
      id: 'admin' as ActiveTab,
      label: 'Admin Panel',
      icon: Shield,
      adminOnly: true,
    },
  ];

  const handleNavClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    setMobileOpen(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#101828] border-r border-[#2A3649] text-gray-200 select-none">
      {/* Brand Header */}
      <div className="p-4 flex items-center justify-between border-b border-[#2A3649]">
        <div
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          {/* Official Gold Z Logo */}
          <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-[#D4AF37]/40 bg-[#080B12] flex items-center justify-center shrink-0 shadow-md shadow-black/40">
            <img
              src="/assets/aistudio/1793501521967_95ee68fd.jpg"
              alt="Zentro Gold Z Logo"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              referrerPolicy="no-referrer"
            />
          </div>

          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-wider font-['Outfit'] text-white flex items-center gap-1.5">
                ZENTRO
                <span className="text-[10px] uppercase font-mono font-semibold tracking-widest text-[#D4AF37] px-1.5 py-0.5 rounded bg-[#D4AF37]/10 border border-[#D4AF37]/30">
                  REWARDS
                </span>
              </span>
              <span className="text-[11px] text-gray-400">Next-Gen Earning Platform</span>
            </div>
          )}
        </div>

        {/* Mobile close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-[#1C2433]"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* User balance snippet (if logged in and not collapsed) */}
      {!collapsed && currentUser && (
        <div className="mx-3 my-3 p-3 rounded-xl bg-[#1C2433] border border-[#2A3649]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-gray-400 font-medium">Available Balance</span>
            <span className="text-[10px] font-mono text-[#D4AF37] uppercase bg-[#D4AF37]/10 px-1 rounded">
              Demo Credits
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37]">
                <Coins className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold font-mono tabular-nums text-white">
                {userProfile ? userProfile.demoCredits.toLocaleString() : '0'}
              </span>
            </div>
            <button
              onClick={() => handleNavClick('wallet')}
              className="text-xs text-[#D4AF37] hover:underline font-medium"
            >
              Wallet
            </button>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        {navItems.map((item) => {
          // If admin only, show special indicator or hide from non-admins unless viewing admin portal
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          if (item.adminOnly && !isAdmin && currentUser) {
            // Non-admin logged in users don't see admin panel link
            return null;
          }

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-[#D4AF37]/20 to-[#D4AF37]/5 text-white border-l-2 border-[#D4AF37]'
                  : 'text-gray-300 hover:text-white hover:bg-[#1C2433]'
              }`}
            >
              <Icon
                className={`w-5 h-5 shrink-0 transition-colors ${
                  isActive ? 'text-[#D4AF37]' : 'text-gray-400 group-hover:text-gray-200'
                }`}
              />
              {!collapsed && (
                <span className="flex-1 text-left truncate flex items-center justify-between">
                  <span>{item.label}</span>
                  {item.adminOnly && (
                    <span className="text-[9px] uppercase tracking-wider font-mono bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 px-1 py-0.5 rounded">
                      Admin
                    </span>
                  )}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Profile & Collapse Actions */}
      <div className="p-3 border-t border-[#2A3649] space-y-2">
        {currentUser ? (
          <div className="flex items-center justify-between gap-2">
            {!collapsed ? (
              <div
                onClick={() => handleNavClick('profile')}
                className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0 p-1.5 rounded-lg hover:bg-[#1C2433]"
              >
                <div className="w-8 h-8 rounded-full bg-[#1C2433] border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] font-bold text-xs uppercase shrink-0 overflow-hidden">
                  {userProfile?.photoURL ? (
                    <img
                      src={userProfile.photoURL}
                      alt={userProfile.displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    userProfile?.displayName?.charAt(0) || 'Z'
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-white truncate">
                    {userProfile?.displayName || 'User'}
                  </p>
                  <p className="text-[11px] text-gray-400 truncate">{currentUser.email}</p>
                </div>
              </div>
            ) : (
              <div
                onClick={() => handleNavClick('profile')}
                className="w-8 h-8 mx-auto rounded-full bg-[#1C2433] border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] font-bold text-xs uppercase cursor-pointer"
              >
                {userProfile?.displayName?.charAt(0) || 'Z'}
              </div>
            )}

            {!collapsed && (
              <button
                onClick={logout}
                title="Log out"
                className="p-2 text-gray-400 hover:text-red-400 rounded-lg hover:bg-[#1C2433] transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          !collapsed && (
            <button
              onClick={onOpenAuth}
              className="w-full py-2 px-3 rounded-lg bg-[#D4AF37] hover:bg-[#E5C358] text-[#080B12] font-semibold text-xs tracking-wide transition-all shadow-md flex items-center justify-center gap-2"
            >
              Sign In / Register
            </button>
          )
        )}

        {/* Desktop Collapse Toggle */}
        <div className="hidden md:flex justify-end pt-1">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-[#1C2433] text-xs flex items-center gap-1"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden md:block fixed top-0 left-0 bottom-0 z-30 transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer with Backdrop */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
