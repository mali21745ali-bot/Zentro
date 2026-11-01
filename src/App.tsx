/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Sidebar, ActiveTab } from './components/layout/Sidebar.tsx';
import { TopHeader } from './components/layout/TopHeader.tsx';
import { HomeDashboard } from './components/home/HomeDashboard.tsx';
import { TasksView } from './components/tasks/TasksView.tsx';
import { GamesView } from './components/games/GamesView.tsx';
import { YouTubeView } from './components/youtube/YouTubeView.tsx';
import { WalletView } from './components/wallet/WalletView.tsx';
import { TransactionsView } from './components/wallet/TransactionsView.tsx';
import { ProfileView } from './components/profile/ProfileView.tsx';
import { SettingsView } from './components/settings/SettingsView.tsx';
import { SupportView } from './components/support/SupportView.tsx';
import { AdminPanel } from './components/admin/AdminPanel.tsx';
import { AuthModal, AuthMode } from './components/auth/AuthModal.tsx';
import { NotificationModal } from './components/notifications/NotificationModal.tsx';
import { Shield, Lock } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentUser, isAdmin, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);

  const handleOpenAuth = (mode: AuthMode = 'login') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeDashboard
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenAuth={() => handleOpenAuth('register')}
          />
        );
      case 'tasks':
        return <TasksView onOpenAuth={() => handleOpenAuth('login')} />;
      case 'games':
        return <GamesView onOpenAuth={() => handleOpenAuth('login')} />;
      case 'youtube':
        return <YouTubeView onOpenAuth={() => handleOpenAuth('login')} />;
      case 'wallet':
        return (
          <WalletView
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenAuth={() => handleOpenAuth('login')}
          />
        );
      case 'transactions':
        return <TransactionsView />;
      case 'profile':
        return <ProfileView onOpenAuth={() => handleOpenAuth('login')} />;
      case 'settings':
        return <SettingsView />;
      case 'support':
        return <SupportView />;
      case 'admin':
        if (!isAdmin) {
          return (
            <div className="max-w-md mx-auto my-16 p-8 rounded-2xl bg-[#1C2433] border border-[#2A3649] text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto">
                <Lock className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold font-['Outfit'] text-white">Administrator Access Required</h2>
              <p className="text-xs text-gray-300 leading-relaxed">
                The Zentro Admin Console is strictly restricted to authenticated administrators. Please authenticate with your administrator credentials.
              </p>
              <button
                onClick={() => handleOpenAuth('admin_login')}
                className="px-6 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C358] text-[#080B12] font-bold text-xs shadow-md"
              >
                Sign In as Administrator
              </button>
            </div>
          );
        }
        return <AdminPanel />;
      default:
        return (
          <HomeDashboard
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenAuth={() => handleOpenAuth('register')}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#080B12] text-gray-100 flex flex-col font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        onOpenAuth={() => handleOpenAuth('login')}
      />

      {/* Main Content Column */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? 'md:pl-20' : 'md:pl-64'
        }`}
      >
        {/* Top Header */}
        <TopHeader
          activeTab={activeTab}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenAuth={() => handleOpenAuth('login')}
          collapsed={sidebarCollapsed}
        />

        {/* Viewport Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderContent()}
        </main>

        {/* Footer */}
        <footer className="py-6 px-6 border-t border-[#2A3649]/60 text-center text-xs text-gray-500">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 max-w-7xl mx-auto">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-400 font-['Outfit']">ZENTRO</span>
              <span>·</span>
              <span>Practice & Skill Rewards Ecosystem</span>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <button onClick={() => setActiveTab('support')} className="hover:text-gray-300">
                Help & Terms
              </button>
              <button onClick={() => setActiveTab('support')} className="hover:text-gray-300">
                Privacy
              </button>
              <button onClick={() => handleOpenAuth('admin_login')} className="hover:text-[#D4AF37]">
                Admin Portal
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
        onSuccess={() => {
          if (authMode === 'admin_login') {
            setActiveTab('admin');
          }
        }}
      />

      {/* Notifications Drawer */}
      <NotificationModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
