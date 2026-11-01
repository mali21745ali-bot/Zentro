/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Bell,
  X,
  Check,
  CheckCheck,
  Trash2,
  CheckSquare,
  Award,
  Gamepad2,
  Coins,
  Info,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { AppNotification } from '../../types.ts';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose }) => {
  const {
    notifications,
    unreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications,
  } = useAuth();

  if (!isOpen) return null;

  const renderIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'task':
        return <CheckSquare className="w-4 h-4 text-[#D4AF37]" />;
      case 'quiz':
        return <Award className="w-4 h-4 text-purple-400" />;
      case 'game':
        return <Gamepad2 className="w-4 h-4 text-[#10B981]" />;
      case 'wallet':
        return <Coins className="w-4 h-4 text-[#D4AF37]" />;
      default:
        return <Info className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 sm:p-6 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-sm rounded-2xl bg-[#101828] border border-[#2A3649] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-top-4 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-[#2A3649] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#D4AF37]" />
            <h3 className="text-sm font-bold font-['Outfit'] text-white">Notifications</h3>
            {unreadNotificationCount > 0 && (
              <span className="text-[10px] font-mono font-bold bg-[#10B981] text-black px-1.5 py-0.2 rounded-full">
                {unreadNotificationCount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {unreadNotificationCount > 0 && (
              <button
                onClick={markAllNotificationsAsRead}
                title="Mark all as read"
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-[#1C2433]"
              >
                <CheckCheck className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-[#1C2433]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#2A3649]/60">
          {notifications.length === 0 ? (
            <div className="py-12 px-4 text-center text-xs text-gray-400">
              No notifications yet. You're all caught up!
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => !notif.read && markNotificationAsRead(notif.id)}
                className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer ${
                  notif.read ? 'bg-transparent opacity-75' : 'bg-[#1C2433]/70 hover:bg-[#1C2433]'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-[#080B12] border border-[#2A3649] flex items-center justify-center shrink-0 mt-0.5">
                  {renderIcon(notif.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <h4 className="text-xs font-semibold text-white truncate">
                      {notif.title}
                    </h4>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-[#10B981] shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-gray-300 leading-relaxed">
                    {notif.message}
                  </p>
                  <span className="text-[10px] text-gray-500 font-mono mt-1 block">
                    {new Date(notif.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 border-t border-[#2A3649] flex justify-between items-center text-xs">
            <button
              onClick={clearNotifications}
              className="text-gray-400 hover:text-red-400 flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
            <span className="text-[11px] text-gray-500">
              {notifications.length} total alerts
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
